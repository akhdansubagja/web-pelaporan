import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

// Mengambil semua patokan lokasi (GET)
export async function GET(request: NextRequest) {
    try {
        const { data, error } = await supabase
            .from('landmarks')
            .select('id, name, latitude, longitude');

        if (error) throw error;

        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// Menyimpan patokan lokasi baru (POST)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, latitude, longitude } = body;

        if (!name || !latitude || !longitude) {
            return NextResponse.json({ success: false, error: 'Nama dan Koordinat lokasi wajib diisi' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('landmarks')
            .insert([
                {
                    name,
                    latitude,
                    longitude
                }
            ])
            .select();

        if (error) throw error;

        return NextResponse.json({ success: true, data: data[0], message: 'Patokan lokasi berhasil dibuat' }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
