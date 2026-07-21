import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Menggunakan tipe Promise untuk params (Standar Next.js 15)
type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    // AWAIT params sebelum mengambil ID
    const resolvedParams = await context.params;
    const id = resolvedParams.id;
    
    const body = await request.json();
    const { status, latitude, longitude } = body;

    let updateData: any = {};

    if (status) {
      updateData.status = status;
    }

    if (latitude && longitude) {
      updateData.lokasi = `POINT(${longitude} ${latitude})`;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, error: 'Tidak ada data yang diperbarui' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('laporan_sampah')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, data: data[0], message: 'Laporan berhasil diperbarui' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    // AWAIT params sebelum mengambil ID
    const resolvedParams = await context.params;
    const id = resolvedParams.id;

    const { error } = await supabase
      .from('laporan_sampah')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Laporan berhasil dihapus' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}