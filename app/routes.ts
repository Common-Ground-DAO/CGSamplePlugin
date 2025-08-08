import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
    layout("routes/_layout.tsx", [
        index("routes/home.tsx"),
        route("admin", "routes/admin.tsx"),
    ]),
    route("api/sign", "routes/api.sign.tsx"),
    route("api/airdrop/create", "routes/api.airdrop.create.tsx"),
    route("api/airdrop/list", "routes/api.airdrop.list.tsx"),
    route("api/airdrop/details", "routes/api.airdrop.details.tsx"),
    route("api/airdrop/delete", "routes/api.airdrop.delete.tsx"),
    route("api/vesting/create", "routes/api.vesting.create.tsx"),
    route("api/vesting/list", "routes/api.vesting.list.tsx"),
    route("api/vesting/delete", "routes/api.vesting.delete.tsx"),
] satisfies RouteConfig;
