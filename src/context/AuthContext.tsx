import React, { createContext, useContext, useState, useEffect } from 'react';
import { isFirebaseActive, auth, googleProvider, db } from '../firebase';
import type { User } from '../types';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  getDocs, 
  collection, 
  increment 
} from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isFirebase: boolean;
  login: (email: string, password: string) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
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
    setIsLoading(true);
    
    if (!isFirebaseActive || !auth) {
      // 1. Local Fallback Mode
      const storedUsers = localStorage.getItem('chalkak_users');
      if (!storedUsers) {
        localStorage.setItem('chalkak_users', JSON.stringify(DEMO_USERS));
      }

      const currentUser = localStorage.getItem('chalkak_current_user');
      if (currentUser) {
        setUser(JSON.parse(currentUser) as User);
      } else {
        // Default auto-login as Citizen for convenient local presentation stability
        const citizen = (JSON.parse(localStorage.getItem('chalkak_users') || '[]') as User[])
          .find(u => u.email === 'citizen@chalkak.com') || DEMO_USERS[0];
        setUser(citizen);
        localStorage.setItem('chalkak_current_user', JSON.stringify(citizen));
      }
      setIsLoading(false);
    } else {
      // 2. Live Firebase Auth Sync Listener
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            // Retrieve User profile documents from Firestore users metadata
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userSnap = await getDoc(userDocRef);

            if (userSnap.exists()) {
              const loadedProfile = userSnap.data() as User;
              
              if (loadedProfile.blocked) {
                alert('허위 신고 누적으로 인해 차단된 계정입니다. 관리실에 문의해 주세요.');
                await signOut(auth);
                setUser(null);
                localStorage.removeItem('chalkak_current_user');
              } else {
                setUser(loadedProfile);
                localStorage.setItem('chalkak_current_user', JSON.stringify(loadedProfile));
              }
            } else {
              // Create dynamic metadata if user authenticates but profile was deleted/not-seeded
              const newProfile: User = {
                uid: firebaseUser.uid,
                name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '익명 시민',
                email: firebaseUser.email || '',
                role: 'USER',
                region: '대구광역시 달성군 유가읍',
                points: 0,
                blocked: false,
                falseReportCount: 0,
                createdAt: new Date().toISOString()
              };
              await setDoc(userDocRef, newProfile);
              setUser(newProfile);
              localStorage.setItem('chalkak_current_user', JSON.stringify(newProfile));
            }
          } catch (e) {
            console.error('Firestore user profile sync error:', e);
          }
        } else {
          setUser(null);
          localStorage.removeItem('chalkak_current_user');
        }
        setIsLoading(false);
      });

      return () => unsubscribe();
    }
  }, []);

  /**
   * standard Email Sign In
   */
  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      if (password.length < 4) {
        throw new Error('비밀번호는 최소 4자 이상이어야 합니다.');
      }

      if (!isFirebaseActive || !auth) {
        // Local Mode Authentication
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
      } else {
        // Live Firebase Email Authentication
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const fUser = userCredential.user;

        const userDocRef = doc(db, 'users', fUser.uid);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          const profile = userSnap.data() as User;
          if (profile.blocked) {
            await signOut(auth);
            throw new Error('허위 신고 누적으로 인해 차단된 계정입니다. 지자체 관제 센터에 문의하세요.');
          }
          setUser(profile);
          localStorage.setItem('chalkak_current_user', JSON.stringify(profile));
          return profile;
        } else {
          // Provision missing profiles
          const newProfile: User = {
            uid: fUser.uid,
            name: fUser.displayName || email.split('@')[0],
            email: email,
            role: 'USER',
            region: '대구광역시 달성군 유가읍',
            points: 0,
            blocked: false,
            falseReportCount: 0,
            createdAt: new Date().toISOString()
          };
          await setDoc(userDocRef, newProfile);
          setUser(newProfile);
          localStorage.setItem('chalkak_current_user', JSON.stringify(newProfile));
          return newProfile;
        }
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Google OAuth Google Sign In (Google Login Popup)
   */
  const loginWithGoogle = async (): Promise<User> => {
    setIsLoading(true);
    try {
      if (!isFirebaseActive || !auth || !googleProvider) {
        // Local simulation fallback for convenience (Auto logins as General Citizen)
        console.log('Simulating Google Sign-In in Local Mode...');
        const usersList = JSON.parse(localStorage.getItem('chalkak_users') || '[]') as User[];
        let googleCitizen = usersList.find(u => u.email === 'citizen@chalkak.com');
        if (!googleCitizen) {
          googleCitizen = DEMO_USERS[0];
        }
        setUser(googleCitizen);
        localStorage.setItem('chalkak_current_user', JSON.stringify(googleCitizen));
        return googleCitizen;
      }

      // True Google OAuth Login
      const result = await signInWithPopup(auth, googleProvider);
      const fUser = result.user;

      const userDocRef = doc(db, 'users', fUser.uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const profile = userSnap.data() as User;
        if (profile.blocked) {
          await signOut(auth);
          throw new Error('허위 신고 누적으로 차단된 구글 계정입니다.');
        }
        setUser(profile);
        localStorage.setItem('chalkak_current_user', JSON.stringify(profile));
        return profile;
      } else {
        // Auto-provision user account for fresh OAuth signups
        const newProfile: User = {
          uid: fUser.uid,
          name: fUser.displayName || '구글 시민',
          email: fUser.email || 'google_user@chalkak.com',
          role: 'USER',
          region: '대구광역시 달성군 유가읍', // default region
          points: 0,
          blocked: false,
          falseReportCount: 0,
          createdAt: new Date().toISOString()
        };
        await setDoc(userDocRef, newProfile);
        setUser(newProfile);
        localStorage.setItem('chalkak_current_user', JSON.stringify(newProfile));
        return newProfile;
      }
    } catch (error) {
      console.error('Google Sign-In failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * standard Email Sign Up
   */
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

      if (!isFirebaseActive || !auth) {
        // Local Mode
        const usersList = JSON.parse(localStorage.getItem('chalkak_users') || '[]') as User[];
        const emailExists = usersList.some((u) => u.email.toLowerCase() === email.toLowerCase());

        if (emailExists) {
          throw new Error('이미 사용 중인 이메일 주소입니다.');
        }

        const updatedUsers = [...usersList, newUser];
        localStorage.setItem('chalkak_users', JSON.stringify(updatedUsers));
        setUser(newUser);
        localStorage.setItem('chalkak_current_user', JSON.stringify(newUser));
        return newUser;
      } else {
        // True Firebase SignUp Auth Sync
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const fUser = userCredential.user;
        
        newUser.uid = fUser.uid;

        // Save metadata profile directly to Firestore users document
        await setDoc(doc(db, 'users', fUser.uid), newUser);
        
        setUser(newUser);
        localStorage.setItem('chalkak_current_user', JSON.stringify(newUser));
        return newUser;
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Sign Out
   */
  const logout = async (): Promise<void> => {
    setUser(null);
    localStorage.removeItem('chalkak_current_user');
    if (isFirebaseActive && auth) {
      await signOut(auth);
    }
  };

  /**
   * Add/Deduct points
   */
  const updateUserPoints = async (uid: string, pointsToAdd: number): Promise<void> => {
    // 1. Local Sync
    const usersList = JSON.parse(localStorage.getItem('chalkak_users') || '[]') as User[];
    const updated = usersList.map((u) => {
      if (u.uid === uid) {
        const newPoints = Math.max(0, u.points + pointsToAdd);
        const updatedUser = { ...u, points: newPoints };
        if (user && user.uid === uid) {
          setUser(updatedUser);
          localStorage.setItem('chalkak_current_user', JSON.stringify(updatedUser));
        }
        return updatedUser;
      }
      return u;
    });
    localStorage.setItem('chalkak_users', JSON.stringify(updated));

    // 2. Fire Sync
    if (isFirebaseActive && db) {
      try {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, {
          points: increment(pointsToAdd)
        });
        
        // Refresh local session profile if it refers to active user
        if (user && user.uid === uid) {
          const freshSnap = await getDoc(userRef);
          if (freshSnap.exists()) {
            const freshProfile = freshSnap.data() as User;
            setUser(freshProfile);
            localStorage.setItem('chalkak_current_user', JSON.stringify(freshProfile));
          }
        }
      } catch (e) {
        console.error('Failed to sync points on Firestore:', e);
      }
    }
  };

  /**
   * Block/Unblock users
   */
  const toggleBlockUser = async (uid: string): Promise<void> => {
    // 1. Local Sync
    const usersList = JSON.parse(localStorage.getItem('chalkak_users') || '[]') as User[];
    let targetBlockedVal = false;
    const updated = usersList.map((u) => {
      if (u.uid === uid) {
        targetBlockedVal = !u.blocked;
        const updatedUser = { ...u, blocked: targetBlockedVal };
        if (user && user.uid === uid) {
          setUser(updatedUser);
          localStorage.setItem('chalkak_current_user', JSON.stringify(updatedUser));
        }
        return updatedUser;
      }
      return u;
    });
    localStorage.setItem('chalkak_users', JSON.stringify(updated));

    // 2. Fire Sync
    if (isFirebaseActive && db) {
      try {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, { blocked: targetBlockedVal });
      } catch (e) {
        console.error('Failed to sync blocked status on Firestore:', e);
      }
    }
  };

  /**
   * Increment False Report Penalty
   */
  const incrementFalseReport = async (uid: string): Promise<void> => {
    // 1. Local Sync
    const usersList = JSON.parse(localStorage.getItem('chalkak_users') || '[]') as User[];
    let shouldBlock = false;
    const updated = usersList.map((u) => {
      if (u.uid === uid) {
        const falseCount = u.falseReportCount + 1;
        shouldBlock = falseCount >= 5;
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

    // 2. Fire Sync
    if (isFirebaseActive && db) {
      try {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, {
          falseReportCount: increment(1),
          blocked: shouldBlock ? true : undefined
        });
      } catch (e) {
        console.error('Failed to sync false reports on Firestore:', e);
      }
    }
  };

  /**
   * Retrieve all Users
   */
  const getAllUsers = async (): Promise<User[]> => {
    if (!isFirebaseActive || !db) {
      return JSON.parse(localStorage.getItem('chalkak_users') || '[]') as User[];
    }

    try {
      const snap = await getDocs(collection(db, 'users'));
      const list: User[] = [];
      snap.forEach((doc) => {
        list.push(doc.data() as User);
      });
      return list;
    } catch (e) {
      console.error('Firestore users fetch failed, reading localStorage fallback:', e);
      return JSON.parse(localStorage.getItem('chalkak_users') || '[]') as User[];
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isFirebase: isFirebaseActive,
        login,
        loginWithGoogle,
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
