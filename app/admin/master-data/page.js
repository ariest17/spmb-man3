"use client";
import { useState, useEffect } from "react";
import { Loader2, Save, Trash2, Plus, User, DollarSign, Database } from "lucide-react";
import { toast } from "sonner";

export default function MasterDataPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("keuangan");
  const [biaya, setBiaya] = useState({ biayaLaki: 0, biayaPerempuan: 0 });
  const [listPetugas, setListPetugas] = useState([]);
  const [inputPetugas, setInputPetugas] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/master/keuangan");
      const data = await res.json();
      if (data.settings) setBiaya(data.settings);
      if (data.petugas) setListPetugas(data.petugas);
    } catch (error) {
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  const handleSimpanBiaya = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/master/keuangan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_biaya", data: biaya }),
      });
      if(res.ok) toast.success("Biaya disimpan!");
    } catch (err) { toast.error("Gagal simpan"); }
    finally { setIsSaving(false); }
  };

  const handleTambahPetugas = async (e) => {
    e.preventDefault();
    if (!inputPetugas.trim()) return;
    try {
      const res = await fetch("/api/admin/master/keuangan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "tambah_petugas", data: { nama: inputPetugas } }),
      });
      if (res.ok) {
        toast.success("Petugas ditambah");
        setInputPetugas("");
        fetchData();
      }
    } catch (err) { toast.error("Gagal tambah petugas"); }
  };

  const handleHapusPetugas = async (id) => {
    if (!confirm("Hapus petugas?")) return;
    try {
      await fetch("/api/admin/master/keuangan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "hapus_petugas", data: { id } }),
      });
      toast.success("Petugas dihapus");
      fetchData();
    } catch (err) { toast.error("Gagal hapus"); }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <div className="bg-white p-4 rounded-lg border shadow-sm flex items-center gap-3">
        <div className="bg-green-100 p-2 rounded-lg"><Database className="h-6 w-6 text-green-700" /></div>
        <div>
            <h1 className="text-xl font-bold text-gray-800">Manajemen Master Data</h1>
            <p className="text-sm text-gray-500">Atur biaya daftar ulang dan petugas penerima.</p>
        </div>
      </div>

      <div className="flex space-x-1 bg-white p-1 rounded-xl border w-fit">
          <button onClick={() => setActiveTab("keuangan")} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === "keuangan" ? "bg-green-100 text-green-700" : "text-gray-500"}`}>
            <DollarSign className="h-4 w-4 inline mr-2" /> Keuangan & Petugas
          </button>
      </div>

      {activeTab === "keuangan" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4 flex gap-2"><DollarSign className="text-blue-600"/> Nominal Daftar Ulang</h2>
            <form onSubmit={handleSimpanBiaya} className="space-y-4">
              <div><label className="text-sm font-medium">Laki-laki (Rp)</label><input type="number" value={biaya.biayaLaki} onChange={(e) => setBiaya({ ...biaya, biayaLaki: e.target.value })} className="w-full border rounded-lg p-2" /></div>
              <div><label className="text-sm font-medium">Perempuan (Rp)</label><input type="number" value={biaya.biayaPerempuan} onChange={(e) => setBiaya({ ...biaya, biayaPerempuan: e.target.value })} className="w-full border rounded-lg p-2" /></div>
              <button type="submit" disabled={isSaving} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex justify-center">{isSaving ? <Loader2 className="animate-spin" /> : "Simpan Perubahan"}</button>
            </form>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4 flex gap-2"><User className="text-green-600"/> Daftar Petugas</h2>
            <form onSubmit={handleTambahPetugas} className="flex gap-2 mb-4">
              <input type="text" placeholder="Nama Petugas..." value={inputPetugas} onChange={(e) => setInputPetugas(e.target.value)} className="flex-1 border rounded-lg p-2" />
              <button type="submit" className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700"><Plus /></button>
            </form>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {listPetugas.map((p) => (
                <div key={p.id} className="flex justify-between items-center bg-gray-50 p-3 rounded border">
                  <span>{p.nama}</span>
                  <button onClick={() => handleHapusPetugas(p.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}