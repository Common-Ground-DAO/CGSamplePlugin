import { UserInfoResponsePayload, CommunityInfoResponsePayload, MAX_REQUESTS_PER_MINUTE, ActionResponsePayload, ActionPayload, PluginRequest, PluginRequestInner, PluginContextData, SafeRequest, SafeRequestInner, PluginResponse, CGPluginResponse, InitResponse, PluginResponseInner } from './types';

// Convert Base64 to Uint8Array
function base64ToArrayBuffer(base64: string) {
  console.log('base64', base64);
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}
class CgPluginLib {
  static instance: CgPluginLib | null = null;

  private static requestTimestampHistory: number[] = [];
  private static iframeUid: string;
  private static targetOrigin: string;
  private static parentWindow: Window;
  private static listeners: Record<string, (payload: CGPluginResponse<object>) => void>;
  private static signUrl: string;
  private static publicKeyString: string;
  private static publicKey: CryptoKey;

  private static contextData: PluginContextData;

  private constructor() {
    // The constructor is disabled. Use initialize() to create an instance.
  }

  public static async initialize(iframeUid: string, signUrl: string, publicKey: string): Promise<CgPluginLib> {
    if (
      CgPluginLib.instance &&
      CgPluginLib.iframeUid === iframeUid &&
      CgPluginLib.signUrl === signUrl &&
      CgPluginLib.publicKeyString === publicKey
    ) {
      return CgPluginLib.instance;
    }

    if (CgPluginLib.instance && CgPluginLib.iframeUid !== iframeUid) {
      CgPluginLib.instance.__destroy();
    }

    // Convert PEM to binary ArrayBuffer
    function convertPemToBinary(pem: string) {
      const base64String = pem
          .replace(/-----BEGIN PUBLIC KEY-----/, "")
          .replace(/-----END PUBLIC KEY-----/, "")
          .replace(/\n/g, "")
          .trim();
      return base64ToArrayBuffer(base64String);
    }

    CgPluginLib.iframeUid = iframeUid;
    CgPluginLib.targetOrigin = '*'; // Restrict communication to specific origins for security.
    CgPluginLib.parentWindow = window.parent; // Reference to the parent window.
    CgPluginLib.listeners = {}; // Store custom message listeners.
    CgPluginLib.signUrl = signUrl; // The URL for the request signing route.
    CgPluginLib.publicKeyString = publicKey;

    CgPluginLib.publicKey = await crypto.subtle.importKey('spki', convertPemToBinary(publicKey), { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);

    // Create a new instance using the private constructor.
    const instance = new CgPluginLib();
    
    // Listen for messages from the parent.
    window.addEventListener('message', instance.__handleMessage.bind(instance));
    
    await instance.__initContextData();

    CgPluginLib.instance = instance;
    return instance;
  }

  public static getInstance(): CgPluginLib {
    if (!CgPluginLib.instance) {
      throw new Error('CgPluginLib is not initialized. Call initialize() first.');
    }
    return CgPluginLib.instance;
  }

  private async __initContextData() {
    const response = await this.__safeRequest<InitResponse>({
      type: 'init',
    });

    CgPluginLib.contextData = {
      pluginId: response.data.pluginId,
      userId: response.data.userId,
      communityId: response.data.communityId,
    };
  }

  private __destroy() {
    window.removeEventListener('message', this.__handleMessage.bind(this));
  }

  /**
   * Send a message to the parent window.
   * @param {PluginRequest} payload - The data to send.
   */
  private __sendMessage(payload: PluginRequest | SafeRequest) {
    if (!CgPluginLib.parentWindow) {
      console.error('No parent window available to send messages.');
      return;
    }

    const now = Date.now();
    const history = CgPluginLib.requestTimestampHistory.filter((timestamp) => timestamp > now - 60000);
    history.push(now);
    CgPluginLib.requestTimestampHistory = history;

    if (history.length >= MAX_REQUESTS_PER_MINUTE) {
      throw new Error('Max requests per minute reached for iframe: ' + CgPluginLib.iframeUid);
    }

    CgPluginLib.parentWindow.postMessage(payload, CgPluginLib.targetOrigin);
  }

  /**
   * Handle incoming messages from the parent.
   * @param {MessageEvent} event - The incoming message event.
   */
  private async __handleMessage(event: MessageEvent) {
    // Validate the origin of the message.
    if (CgPluginLib.targetOrigin !== '*' && event.origin !== CgPluginLib.targetOrigin) {
      console.warn('Message origin mismatch:', event.origin);
      return;
    }

    console.log('iframe got message', event.data);
    const { type, payload } = event.data as { type: string, payload: PluginResponse };
    const { response, signature } = payload;
    const responsePayload = JSON.parse(response) as PluginResponseInner;
    
    if (signature) {
      const signatureBuffer = base64ToArrayBuffer(signature);
      const encodedMessage = new TextEncoder().encode(response);

      const isValid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', CgPluginLib.publicKey, signatureBuffer, encodedMessage);
      console.log('signature', signature);
      console.log('isValid', isValid);

      if (!isValid) {
        console.error('Invalid signature');
      }
    }

    if (type && CgPluginLib.listeners[type]) {
      CgPluginLib.listeners[type]({
        data: responsePayload.data,
        __rawResponse: response,
      });
    }
  }

  /**
   * Register a listener for a specific message type.
   * @param {string} type - The type of message to listen for.
   * @param {function} callback - The callback to invoke when the message is received.
   */
  private __on<T extends object>(type: string, callback: (payload: CGPluginResponse<T>) => void) {
    CgPluginLib.listeners[type] = callback as (payload: CGPluginResponse<object>) => void;
  }

  /**
   * Remove a listener for a specific message type.
   * @param {string} type - The type of message to remove.
   */
  private __off(type: string) {
    delete CgPluginLib.listeners[type];
  }

  private __safeRequest<T extends object>(
    payload: SafeRequestInner['data'],
    timeout: number = 2000,
    maxAttempts: number = 3
  ): Promise<CGPluginResponse<T>> {
    return new Promise(async (resolve, reject) => {
    const requestId = `safeRequest-${Date.now()}-${payload.type}`;
    let timeoutId: NodeJS.Timeout | undefined;

    // Listener for the response.
    const responseListener = (payload: CGPluginResponse<T>) => {
      resolve(payload);
      clearTimeout(timeoutId);
      this.__off(requestId);
    };

    // Set up the listener for the response.
    this.__on(requestId, responseListener);

    const safeRequest: SafeRequest = {
      request: JSON.stringify({
        type: 'safeRequest',
        data: payload,
        iframeUid: CgPluginLib.iframeUid,
        requestId,
      }),
    };

    let attempts = 0;
    const attemptSend = () => {
      attempts++;

      // Send the request to the parent.
      this.__sendMessage(safeRequest);

      timeoutId = setTimeout(() => {
        if (attempts < maxAttempts) {
          attemptSend();
        } else {
          reject(new Error('Request timed out'));
        }
      }, timeout);
    };

      attemptSend();
    });
  }

  private __request<T extends object>(
    payload: Omit<PluginRequestInner, 'requestId' | 'pluginId'>,
    timeout: number = 2000,
    maxAttempts: number = 3
  ): Promise<CGPluginResponse<T>> {
    return new Promise(async (resolve, reject) => {
      const pluginRequest = await fetch(CgPluginLib.signUrl, {
        method: 'POST',
        body: JSON.stringify({ ...payload, pluginId: CgPluginLib.contextData.pluginId }),
      }).then(res => res.json()) as PluginRequest;
      
      const { request } = pluginRequest;
      const requestId = JSON.parse(request).requestId;

      let timeoutId: NodeJS.Timeout | undefined;

      // Listener for the response.
      const responseListener = (payload: CGPluginResponse<T>) => {
        resolve(payload);
        clearTimeout(timeoutId);
        this.__off(requestId);
      };

      // Set up the listener for the response.
      this.__on(requestId, responseListener);

      let attempts = 0;
      const attemptSend = () => {
        attempts++;
        this.__sendMessage(pluginRequest);

        timeoutId = setTimeout(() => {
          if (attempts < maxAttempts) {
            attemptSend();
          } else {
            reject(new Error('Request timed out'));
          }
        }, timeout);
      };

      attemptSend();
    });
  }

  /**
   * Get the user info from the parent.
   * @returns {Promise<CgPluginLib.Response.UserInfo>} A promise that resolves to the user info.
   */
  public async getUserInfo(): Promise<CGPluginResponse<UserInfoResponsePayload>> {
    return this.__request<UserInfoResponsePayload>({
      type: 'request',
      data: {
        type: 'userInfo',
      },
      iframeUid: CgPluginLib.iframeUid,
    });
  }

  /**
   * Get the community info from the parent.
   * @returns {Promise<CgPluginLib.Response.CommunityInfo>} A promise that resolves to the community info.
   */
  public async getCommunityInfo(): Promise<CGPluginResponse<CommunityInfoResponsePayload>> {
    return this.__request<CommunityInfoResponsePayload>({
      type: 'request',
      data: {
        type: 'communityInfo',
        communityId: CgPluginLib.contextData.communityId,
      },
      iframeUid: CgPluginLib.iframeUid,
    });
  }

  /**
   * Give a role to a user in the community.
   * @param {string} roleId - The ID of the role to give.
   * @param {string} userId - The ID of the user to give the role to.
   * @returns {Promise<ActionResponsePayload>} A promise that resolves to the action response.
   */
  public async giveRole(roleId: string, userId: string): Promise<CGPluginResponse<ActionResponsePayload>> {
    const payload: ActionPayload = { type: 'giveRole', roleId, userId, communityId: CgPluginLib.contextData.communityId };
    return this.__request<ActionResponsePayload>({
      type: 'action',
      data: payload,
      iframeUid: CgPluginLib.iframeUid,
    });
  }
}

// Export the library as a global variable or as a module.
export default CgPluginLib;
