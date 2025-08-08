import type { CommunityInfoResponsePayload } from "@common-ground-dao/cg-plugin-lib";
import type { UserFriendsResponsePayload } from "@common-ground-dao/cg-plugin-lib-host";
import { useCallback, useEffect, useState } from "react";
import { Button } from "~/components/Button";
import { Table, TableRoot, TableRow, TableHeaderCell, TableHead, TableCell, TableBody } from "~/components/Table";
import { useCgData } from "~/context/cg_data";
import { useCgPluginLib } from "~/context/plugin_lib";

function communityPremiumToString(premium: CommunityInfoResponsePayload['premium']): string {
  switch (premium) {
    case 'FREE':
      return 'Free tier';
    case 'BASIC':
      return 'Basic tier';
    case 'PRO':
      return 'Pro tier';
    case 'ENTERPRISE':
      return 'Enterprise tier';
    default:
      return 'Unknown tier';
  }
}

export default function Home() {
  const pluginLib = useCgPluginLib();
  const cgData = useCgData();

  const [friends, setFriends] = useState<UserFriendsResponsePayload | null>(null);
  const fetchFriends = useCallback(async () => {
    if (pluginLib) {
      const friendsData = await pluginLib.getUserFriends(10, 0);
      setFriends(friendsData.data);
    }
  }, [pluginLib]);

  // Request user friends if permission is granted
  useEffect(() => {
    if (pluginLib) {
      fetchFriends();
    }
  }, [pluginLib]);




  return (<div className="flex flex-col gap-4 flex-1">
    <h2>Hello there :)</h2>
    <p>This is a sample plugin for Common Ground. It demonstrates how to use the plugin library to navigate and interact with the platform.</p>

    <div className="bg-white rounded-lg shadow-md p-4">
      <h2>User Info</h2>
      <p>Here's the available user information (for more data, be sure to allow more permissions for this plugin):</p>

      <TableRoot>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Value</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cgData.userInfo?.id && (
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>{cgData.userInfo.id}</TableCell>
              </TableRow>
            )}
            {cgData.userInfo?.name && (
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>{cgData.userInfo.name}</TableCell>
              </TableRow>
            )}
            {cgData.userInfo?.imageUrl && (
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>
                  <img src={cgData.userInfo.imageUrl} alt="User Avatar" className="w-16 h-16 object-cover rounded-full" />
                </TableCell>
              </TableRow>
            )}
            {cgData.userInfo?.email && (
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>{cgData.userInfo.email}</TableCell>
              </TableRow>
            )}
            {cgData.userInfo?.twitter?.username && (
              <TableRow>
                <TableCell>Twitter</TableCell>
                <TableCell>{cgData.userInfo.twitter.username}</TableCell>
              </TableRow>
            )}
            {cgData.userInfo?.lukso?.username && (
              <TableRow>
                <TableCell>Lukso</TableCell>
                <TableCell>{cgData.userInfo.lukso.username}</TableCell>
              </TableRow>
            )}
            {cgData.userInfo?.farcaster?.username && (
              <TableRow>
                <TableCell>Farcaster</TableCell>
                <TableCell>{cgData.userInfo.farcaster.username}</TableCell>
              </TableRow>
            )}
            {cgData.userInfo?.premium && cgData.userInfo?.premium !== 'FREE' && (
              <TableRow>
                <TableCell>Premium</TableCell>
                <TableCell>{cgData.userInfo.premium === 'GOLD' ? 'Gold supporter' : 'Silver supporter'}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableRoot>
    </div>

    <div className="bg-white rounded-lg shadow-md p-4">
      <h2>Community Info</h2>
      <p>Here's the available community information:</p>
      <TableRoot>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Value</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cgData.communityInfo?.id && (
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>{cgData.communityInfo.id}</TableCell>
              </TableRow>
            )}
            {cgData.communityInfo?.title && (
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>{cgData.communityInfo.title}</TableCell>
              </TableRow>
            )}
            {cgData.communityInfo?.largeLogoUrl && (
              <TableRow>
                <TableCell>Logo</TableCell>
                <TableCell>
                  <img src={cgData.communityInfo.largeLogoUrl} alt="Community Logo" className="w-10 h-10 rounded" />
                </TableCell>
              </TableRow>
            )}
            {cgData.communityInfo?.official && (
              <TableRow>
                <TableCell>Official</TableCell>
                <TableCell>{cgData.communityInfo.official ? 'Yes' : 'No'}</TableCell>
              </TableRow>
            )}
            {cgData.communityInfo?.premium && (
              <TableRow>
                <TableCell>Premium</TableCell>
                <TableCell>{communityPremiumToString(cgData.communityInfo.premium)}</TableCell>
              </TableRow>
            )}
            {cgData.communityInfo?.url && (
              <TableRow>
                <TableCell>URL</TableCell>
                <TableCell>{cgData.communityInfo.url}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableRoot>
    </div>

    <div className="bg-white rounded-lg shadow-md p-4">
      <h2>Role Management</h2>
      <p>Here you can see the roles you have and assign new roles if available. For this to work, you will need to assign on the community settings which roles are able to be given.</p>

      <TableRoot>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Role Title</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cgData.communityInfo?.roles.filter(role => role.title !== 'Public').map((role) => {
              return (
                <TableRow key={role.id}>
                  <TableCell>{role.title}</TableCell>
                  <TableCell>
                    {cgData.userInfo?.roles.includes(role.id) ? 'Assigned' : <Button onClick={async () => {
                      await pluginLib?.giveRole(role.id, cgData.userInfo?.id || '');
                      await cgData.refresh();
                    }}>
                      Get Role
                    </Button>}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableRoot>
    </div>

    <div className="bg-white rounded-lg shadow-md p-4">
      <h2>User Friends</h2>
      <p>If the permission is asked and given, you may also see the user friends on a plugin.</p>

      {friends?.friends ? (<TableRoot>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Friend</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {friends?.friends.map((friend) => (
              <TableRow key={friend.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <img src={friend.imageUrl} alt={`${friend.name}'s avatar`} className="w-10 h-10 rounded" />
                    {friend.name}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableRoot>) : (
        <div className="bg-gray-100 p-4 rounded-lg text-sm text-gray-600">
          No friends data available. Please request permission to access friends or try adding someone on CG.
        </div>
      )}
    </div>
  </div>
  );
}