import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

// 1. Definisikan tipe params sebagai Promise (Syarat Next.js 15)
type RouteContext = {
  params: Promise<{ id: string }>;
};

// 2. Gunakan RouteContext
export async function DELETE(request: NextRequest, context: RouteContext) {
    try {
        // 3. Await params sebelum mengambil ID-nya
        const resolvedParams = await context.params;
        const id = resolvedParams.id;

        const { error } = await supabase
            .from('landmarks')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true, message: 'Patokan lokasi berhasil dihapus' }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}