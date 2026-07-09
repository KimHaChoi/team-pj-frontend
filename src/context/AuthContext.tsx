import React, { createContext, useContext, useState, useEffect } from 'react';
import { isFirebaseActive } from '../firebase';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isFirebase: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (email: string, password: string, name: string, region: string, role?: 'USER' | 'ADMIN') => Promise<User>;
  logout: () => Promise<void>;
  updateUserPoints: (uid: string, pointsToAdd: number) => Promise<void>;
  toggleBlockUser: (uid: string) => Promise<void>;
  incrementFalseReport: (uid: string) => Promise<void>;
  getAllUsers: () => Promise<User[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial Demo Seed Accounts for Local Mode
const DEMO_USERS: User[] = [
  {
    uid: 'user-citizen',
    name: '김대구',
    email: 'citizen@chalkak.com',
    role: 'USER',
    region: '대구시 달성군 현풍읍',
    points: 420,
    blocked: false,
    falseReportCount: 0,
    createdAt: new Date(Date.now() - 30 * 24 * 3600000).toISOString()
  },
  {
    uid: 'user-admin',
    name: '김관리관',
    email: 'admin@chalkak.com',
    role: 'ADMIN',
    region: '대구시 달성군청',
    points: 0,
    blocked: false,
    falseReportCount: 0,
    createdAt: new Date(Date.now() - 30 * 24 * 3600000).toISOString()
  },
  {
    uid: 'user-bad',
    name: '장난꾼',
    email: 'troller@chalkak.com',
    role: 'USER',
    region: '대구시 중구',
    points: 0,
    blocked: false,
    falseReportCount: 3,
    createdAt: new Date(Date.now() - 2 * 24 * 3600000).toISOString()
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize and check current auth state
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      if (!isFirebaseActive) {
        // Local Fallback Mode
        const storedUsers = localStorage.getItem('chalkak_users');
        if (!storedUsers) {
          localStorage.setItem('chalkak_users', JSON.stringify(DEMO_USERS));
        }

        const currentUser = localStorage.getItem('chalkak_current_user');
        if (currentUser) {
          setUser(JSON.parse(currentUser) as User);
        } else {
          // Default: auto login as Citizen for convenient demonstration
          const citizen = (JSON.parse(localStorage.getItem('chalkak_users') || '[]') as User[])
            .find(u => u.email === 'citizen@chalkak.com') || DEMO_USERS[0];
          setUser(citizen);
          localStorage.setItem('chalkak_current_user', JSON.stringify(citizen));
        }
      } else {
        // Firebase Auth Mode:
        // For standard presentation stability, we can support simple client-side stored session fallback 
        // that synchronizes with a Firebase 'users' collection, keeping it lightweight
        const storedUser = localStorage.getItem('chalkak_current_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser) as User);
        } else {
          // Autologin in firebase mode if needed, otherwise null
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      // Minimum verification for demo
      if (password.length < 4) {
        throw new Error('비밀번호는 최소 4자 이상이어야 합니다.');
      }

      const usersList = JSON.parse(localStorage.getItem('chalkak_users') || '[]') as User[];
      const found = usersList.find((u) => u.email.toLowerCase() === email.toLowerCase());

      if (!found) {
        throw new Error('존재하지 않는 계정입니다. 회원가입을 먼저 진행해 주세요.');
      }

      if (found.blocked) {
        throw new Error('허위 신고 누적으로 인해 차단된 계정입니다. 지자체 관제 센터에 문의하세요.');
      }

      setUser(found);
      localStorage.setItem('chalkak_current_user', JSON.stringify(found));
      return found;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    email: string,
    password: string,
    name: string,
    region: string,
    role: 'USER' | 'ADMIN' = 'USER'
  ): Promise<User> => {
    setIsLoading(true);
    try {
      if (password.length < 4) {
        throw new Error('비밀번호는 최소 4자 이상이어야 합니다.');
      }

      const usersList = JSON.parse(localStorage.getItem('chalkak_users') || '[]') as User[];
      const emailExists = usersList.some((u) => u.email.toLowerCase() === email.toLowerCase());

      if (emailExists) {
        throw new Error('이미 사용 중인 이메일 주소입니다.');
      }

      const newUser: User = {
        uid: `user-${Date.now()}`,
        name,
        email,
        role,
        region,
        points: 0,
        blocked: false,
        falseReportCount: 0,
        createdAt: new Date().toISOString()
      };

      const updatedUsers = [...usersList, newUser];
      localStorage.setItem('chalkak_users', JSON.stringify(updatedUsers));
      setUser(newUser);
      localStorage.setItem('chalkak_current_user', JSON.stringify(newUser));

      return newUser;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setUser(null);
    localStorage.removeItem('chalkak_current_user');
  };

  const updateUserPoints = async (uid: string, pointsToAdd: number): Promise<void> => {
    const usersList = JSON.parse(localStorage.getItem('chalkak_users') || '[]') as User[];
    const updated = usersList.map((u) => {
      if (u.uid === uid) {
        const newPoints = Math.max(0, u.points + pointsToAdd);
        const updatedUser = { ...u, points: newPoints };
        // Sync active session if this is the logged-in user
        if (user && user.uid === uid) {
          setUser(updatedUser);
          localStorage.setItem('chalkak_current_user', JSON.stringify(updatedUser));
        }
        return updatedUser;
      }
      return u;
    });
    localStorage.setItem('chalkak_users', JSON.stringify(updated));
  };

  const toggleBlockUser = async (uid: string): Promise<void> => {
    const usersList = JSON.parse(localStorage.getItem('chalkak_users') || '[]') as User[];
    const updated = usersList.map((u) => {
      if (u.uid === uid) {
        const updatedUser = { ...u, blocked: !u.blocked };
        if (user && user.uid === uid) {
          setUser(updatedUser);
          localStorage.setItem('chalkak_current_user', JSON.stringify(updatedUser));
        }
        return updatedUser;
      }
      return u;
    });
    localStorage.setItem('chalkak_users', JSON.stringify(updated));
  };

  const incrementFalseReport = async (uid: string): Promise<void> => {
    const usersList = JSON.parse(localStorage.getItem('chalkak_users') || '[]') as User[];
    const updated = usersList.map((u) => {
      if (u.uid === uid) {
        const falseCount = u.falseReportCount + 1;
        // Block automatically if false reports reach 5
        const shouldBlock = falseCount >= 5;
        const updatedUser = { ...u, falseReportCount: falseCount, blocked: shouldBlock ? true : u.blocked };
        if (user && user.uid === uid) {
          setUser(updatedUser);
          localStorage.setItem('chalkak_current_user', JSON.stringify(updatedUser));
        }
        return updatedUser;
      }
      return u;
    });
    localStorage.setItem('chalkak_users', JSON.stringify(updated));
  };

  const getAllUsers = async (): Promise<User[]> => {
    return JSON.parse(localStorage.getItem('chalkak_users') || '[]') as User[];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isFirebase: isFirebaseActive,
        login,
        signup,
        logout,
        updateUserPoints,
        toggleBlockUser,
        incrementFalseReport,
        getAllUsers
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
