import CgPluginLibHost from "../../../pluginLib/cgPluginLibHost";

const privateKey = `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA23Mcgykbnnikfo2JyZTAziUrO0ZvCANXmRuGpj2aozuev9Ut
QUhmVEbwaCyeHUCKAqoTw9pBbKzR+cgt6VTAMXmD4N+xbPIEryyLMjIz6nKHypfY
OCw+Hco232nDsu0eKNUF1+WkdcIuQ+4PMMZCUViaPzn3dE5XCRRWTSg8H0WDseWS
eNaYpa19g3KNradv7AY7CMb4S+/8PKvuS5d4zbd7yo1Zs/Sh/LY/lsoq83aRvdno
dv8tsGrZAshcTqYdTfcFCcfNH8xy28B4DRxsRcW6bf2EknvPGJilMSwNCDDgd6ZG
9h17mX0vRj1I5fWgZwsfmnb4/v2aFvDYBAWN9wIDAQABAoIBAB0iCAFQPhlop2B2
8SQwukk5B/yOL4P0evbu1OOm6VY4Plf141R3rxYLIN6Y5cNjuQP83jOG+wkusZAj
x2yNfWz+q8ejtWM4Me+reIMzxPlKi8UVKXWI8hTJrpqJk5sM/Y8AJg7GWXHvUxhe
Nz1guex2AxbXtDEy4T0UVRdYexAkzxVgdoEXlAuKlFxRUdX0wlCp3eH3KlB0J/90
Tpm+EHQh+W+H7ZVjkSfv9jOuILsZX5tUuD7dMP/mxi9Ng3oQrISWxH4jXvlAJ/OB
LH+uGywnz9av9PG9aBs5VfTvPQHKuGiH02BsiKc6y/VwXMIxmv9nkm2cD4/ZIh1a
DMAy8kECgYEA7wHWZaN/RR9BcHSlI3nc9g5w8HqSl/htYhegfBYQqspYhJlzJ1k5
XoRxKZA0m2rkEwlZ6xjaTKQReurI/gH7YkVvT1uV4EaAlRIco8//yYWYSkp9aXCi
wb9M6yh+DafA7yl67wrukOICUlppKaWI5NSyZFB0Eea6w4hVGWMOMJcCgYEA6w1O
17tvhMmUPMvwxLPx74e31reucunzrPpSWNCIeeS81ODQDeN4kARBukMmKJTb0ZyH
ftsqDUyoR9ZF2IAnnnbr0W4iAODQuGZH290m1KV4eskL+EiHwfmYbh8V2NIDQ3NB
qNPpUQ+XkMtBpI5g1HRTtvzi00kBmxifWdp/2aECgYAUbSLGoveAj9BG7SEj7AlP
WiKa2s7mgAvRI1XK5RPdlNeF1Zt61GxLwKPvOmzUj4kYe2cc6Y3WmPsJd0FgPAkg
9/AwZxJjDYN1uguKkH862NkQGFepiD/QsSnAu0AyqJCbn/7qqROEfFxYb3OnZIdT
jz4DxsB0uzRg+6jSN54B1wKBgQDbrD9QLXOG1WG+BBeLrmTgqKVufZIDAZTjx7qo
GJRD3zt/dG/dWwb1CZVn/5Os/5oE51ZWf3tonIj1QlNaiEL+vUOdImGTEojenXBx
EdlViSP1FOoj65088wi7ej/PuE6mfhQSNaJrSLgs8Vjy8sGaLPGEJgnSzvs6OSPM
NQGhoQKBgQDSyq1M4VutpXov93MJNhrq5SBSdcLH63gTcOOlGXG2A68gTzYMUP2j
0NOugFXlZCyYzkXpYXK0Mn5KTq5AwnHbn3ZnBpb4HyBmQQTaLwqZJT0Bdjwbg8RG
d3u7gjXywVv85ZGxjUrYaPrspQAzFSfrgAyF4YuCAcPZTvdn1V4Vgg==
-----END RSA PRIVATE KEY-----`;


export async function POST(req: Request) {
    const body = await req.json();

    const cgPluginLibHost = new CgPluginLibHost(privateKey);
    const { request, signature } = await cgPluginLibHost.signRequest(body);

    return Response.json({ request, signature });
}