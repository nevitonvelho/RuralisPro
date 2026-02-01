import { useEffect, useState } from 'react';
import { useAuth } from "@/context/AuthContext"; // Use context instead of direct auth
import {
    getRecentReports,
    getClients,
    deleteReport,
    Report
} from "@/services/firestore";
import { useRouter } from 'next/navigation';
import {
    BarChart3,
    Users,
    FileText,
    Settings,
    Plus,
    ArrowRight,
    Trash2,
    Edit // Add icons
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth(); // Use context
    const [recentAnalyses, setRecentAnalyses] = useState<Report[]>([]); // Typed state
    const [clientsCount, setClientsCount] = useState(0);
    const [loadingData, setLoadingData] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/');
            return;
        }

        if (user?.uid) {
            loadDashboardData(user.uid);
        }
    }, [user, authLoading, router]);

    const loadDashboardData = async (uid: string) => {
        setLoadingData(true);
        try {
            const [reports, clients] = await Promise.all([
                getRecentReports(uid),
                getClients(uid)
            ]);
            setRecentAnalyses(reports);
            setClientsCount(clients.length);
        } catch (error) {
            console.error("Erro ao carregar dashboard:", error);
        } finally {
            setLoadingData(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Tem certeza que deseja excluir esta análise?")) {
            await deleteReport(id);
            if (user?.uid) loadDashboardData(user.uid); // Reload
        }
    }

    if (authLoading || loadingData) {
        // ... (loader)
    }

    // ... (rest of component with dynamic data mapping)
}
