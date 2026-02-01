import {
    getFirestore,
    collection,
    addDoc,
    query,
    where,
    getDocs,
    orderBy,
    limit,
    serverTimestamp,
    doc,
    getDoc,
    setDoc,
    deleteDoc,
    updateDoc
} from 'firebase/firestore';
import { app } from '@/lib/firebase';

const db = getFirestore(app);

// Tipos
export interface Client {
    id?: string;
    userId: string;
    name: string;
    location?: string;
    createdAt: any;
}

export interface Report {
    id?: string;
    userId: string;
    type: string; // ex: 'adubacao', 'calagem'
    title: string; // Título gerado (ex: Adubação - Fazenda X)
    data: any; // O objeto JSON com todos os inputs
    clientName?: string;
    createdAt: any;
}

// --- CLIENTES ---

export const saveClient = async (userId: string, name: string, location?: string) => {
    try {
        // Verifica se já existe um cliente com esse nome para este usuário para evitar duplicatas simples
        const q = query(
            collection(db, 'clients'),
            where('userId', '==', userId),
            where('name', '==', name)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            return snapshot.docs[0].id; // Retorna o ID do existente
        }

        const docRef = await addDoc(collection(db, 'clients'), {
            userId,
            name,
            location: location || '',
            createdAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error("Erro ao salvar cliente:", error);
        throw error;
    }
};

export const getClients = async (userId: string) => {
    try {
        const q = query(
            collection(db, 'clients'),
            where('userId', '==', userId)
            // Removido orderBy do banco para evitar erro de índice
        );
        const snapshot = await getDocs(q);
        const clients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));

        // Ordenação via código (Client-side)
        return clients.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
        console.error("Erro ao buscar clientes:", error);
        throw error;
    }
};

// --- RELATÓRIOS ---

export const saveReport = async (userId: string, type: string, title: string, data: any, clientName?: string) => {
    try {
        console.log(`Firestore: Salvando relatório para UserID: ${userId}, Tipo: ${type}`);
        const docRef = await addDoc(collection(db, 'reports'), {
            userId,
            type,
            title,
            data,
            clientName: clientName || 'Não informado',
            createdAt: serverTimestamp()
        });
        console.log(`Firestore: Relatório salvo com ID: ${docRef.id}`);
        return docRef.id;
    } catch (error) {
        console.error("Erro ao salvar relatório:", error);
        throw error;
    }
};

export const getRecentReports = async (userId: string, limitCount = 5) => {
    try {
        console.log(`Firestore: Buscando relatórios recentes para UserID: ${userId}`);
        const q = query(
            collection(db, 'reports'),
            where('userId', '==', userId)
            // Removido orderBy e limit do banco para evitar erro de índice
        );
        const snapshot = await getDocs(q);
        console.log(`Firestore: Encontrados ${snapshot.docs.length} documentos (antes da filtragem).`);

        const reports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Report));

        // Ordenação via código (Descendente por data)
        reports.sort((a, b) => {
            const dateA = a.createdAt?.seconds || 0;
            const dateB = b.createdAt?.seconds || 0;
            return dateB - dateA;
        });

        return reports.slice(0, limitCount);
    } catch (error) {
        console.error("Erro ao buscar relatórios recentes:", error);
        throw error;
    }
};

export const getReportsByType = async (userId: string, type: string) => {
    try {
        const q = query(
            collection(db, 'reports'),
            where('userId', '==', userId),
            where('type', '==', type)
        );
        const snapshot = await getDocs(q);
        const reports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Report));

        reports.sort((a, b) => {
            const dateA = a.createdAt?.seconds || 0;
            const dateB = b.createdAt?.seconds || 0;
            return dateB - dateA;
        });

        return reports;
    } catch (error) {
        console.error("Erro ao buscar relatórios por tipo:", error);
        throw error;
    }
};

// --- DELETAR / ATUALIZAR ---

export const deleteReport = async (reportId: string) => {
    try {
        await deleteDoc(doc(db, 'reports', reportId));
    } catch (error) {
        console.error("Erro ao deletar relatório:", error);
        throw error;
    }
};

export const deleteClient = async (clientId: string) => {
    try {
        await deleteDoc(doc(db, 'clients', clientId));
    } catch (error) {
        console.error("Erro ao deletar cliente:", error);
        throw error;
    }
};

export const getReportById = async (reportId: string) => {
    try {
        const docRef = doc(db, 'reports', reportId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Report;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Erro ao buscar relatório por ID:", error);
        throw error;
    }
};

export const updateReport = async (reportId: string, data: any) => {
    try {
        const docRef = doc(db, 'reports', reportId);
        await updateDoc(docRef, {
            ...data,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Erro ao atualizar relatório:", error);
        throw error;
    }
};
