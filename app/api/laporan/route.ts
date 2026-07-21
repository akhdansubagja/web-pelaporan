import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase'; // Sesuaikan path ini dengan lokasi file config Supabase Anda

// Mengambil data titik sampah (GET)
export async function GET(request: NextRequest) {
    try {
        // Mengambil parameter query (misal: ?status=approved)
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') || 'approved'; // Default hanya mengambil yang disetujui untuk peta publik

        const { data, error } = await supabase
            .from('laporan_sampah')
            .select('id, deskripsi, foto_url, status, lokasi')
            .eq('status', status);

        if (error) throw error;

        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// Menyimpan laporan sampah baru (POST)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { deskripsi, foto_url, latitude, longitude, status } = body;

        // Validasi input dasar
        if (!latitude || !longitude) {
            return NextResponse.json({ success: false, error: 'Koordinat lokasi wajib diisi' }, { status: 400 });
        }

        // Format koordinat ke WKT (Well-Known Text) untuk PostGIS: POINT(longitude latitude)
        // Perhatikan: urutannya adalah Longitude dulu, baru Latitude!
        const pointLocation = `POINT(${longitude} ${latitude})`;

        const { data, error } = await supabase
            .from('laporan_sampah')
            .insert([
                {
                    deskripsi: deskripsi || '',
                    foto_url: foto_url || '',
                    lokasi: pointLocation, // Supabase akan otomatis mengonversi string ini menjadi tipe Geometry di PostGIS
                    status: status || 'pending' // Default status laporan baru, bisa di-override oleh admin menjadi 'approved'
                }
            ])
            .select();

        if (error) throw error;

        return NextResponse.json({ success: true, data: data[0], message: 'Laporan berhasil dibuat' }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
