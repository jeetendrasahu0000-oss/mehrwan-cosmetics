import { useEffect, useState } from "react";
import { adminAPI } from "../../services/adminService";

const AdminCustomers = () => {
  const [users, setUsers] = useState([]);

  const load = () => adminAPI.getAllUsers().then((r) => setUsers(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const toggle = async (id) => {
    await adminAPI.toggleBlockUser(id);
    load();
  };

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold mb-6">Customers</h1>
      <div className="bg-white rounded-2xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-ink/5 text-left text-xs uppercase text-ink/50">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-t border-ink/5">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-ink/60">{u.email}</td>
                <td className="px-4 py-3 text-ink/50">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <span className={`text-[11px] px-2 py-1 rounded-full ${u.isBlocked ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                    {u.isBlocked ? "Blocked" : "Active"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => toggle(u._id)} className="text-xs font-medium text-blush-700 hover:underline">
                    {u.isBlocked ? "Unblock" : "Block"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCustomers;