import AdminView from "../views/admin/admin";

export function meta() {
  return [
    { title: "Admin view" },
    { name: "description", content: "Manage plugin info only an admin can see" },
  ];
}

export default function Admin() {
  return <AdminView />;
} 