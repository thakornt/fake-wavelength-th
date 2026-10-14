'use client'

import { createContext, useState, ReactNode, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

type UserProfile = {
  userName: string
  roomId?: string
  // id สาธารณะ (server คำนวณจาก playerSecret แล้วส่งกลับมา) ใช้เทียบกับ state ที่ได้จาก server เท่านั้น
  userId?: string
  // ความลับของผู้เล่น สร้างที่เครื่องครั้งเดียว ใช้พิสูจน์ตัวตนกับ server ห้ามส่งให้ผู้เล่นคนอื่น
  playerSecret?: string
}

type UserProfileContextType = {
  profile: UserProfile
  updateProfile: (newProfile: Partial<UserProfile>) => void
  clearProfile: () => void
  profileReady: boolean
}

const LOCAL_STORAGE_KEY = 'userProfile'

export const UserProfileReactContext = createContext<UserProfileContextType | undefined>(undefined);

const getInitialProfile = (): UserProfile => {
  if (typeof window !== 'undefined') {
    const storedProfile = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (storedProfile) {
      try {
        return JSON.parse(storedProfile)
      } catch {
        localStorage.removeItem(LOCAL_STORAGE_KEY)
      }
    }
  }
  return { userName: '' } 
}

export const UserProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile>(getInitialProfile)
  const [profileReady, setProfileReady] = useState(false)

  useEffect(() => {
    let loadedProfile = getInitialProfile()
    // เครื่องที่ยังไม่มี secret (เข้าครั้งแรก / ผู้ใช้เก่าที่มีแต่ userId): สร้างให้ครั้งเดียวแล้วเก็บไว้
    // userId เก่าล้างทิ้ง เพราะ id ที่ client ตั้งเองใช้ไม่ได้แล้ว (server จะส่ง id ใหม่ที่คำนวณจาก secret กลับมาตอนเข้าห้อง)
    // ทำที่นี่ที่เดียวแทนที่จะทำในหน้า lobby เพื่อไม่ให้แย่งกันเขียนทับกับการโหลด profile
    if (!loadedProfile.playerSecret) {
      loadedProfile = { ...loadedProfile, playerSecret: uuidv4(), userId: undefined }
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(loadedProfile))
    }
    setProfile(loadedProfile)
    setProfileReady(true)
  }, [])

  const updateProfile = (newProfile: Partial<UserProfile>) => {
    setProfile(prev => {
      const updatedProfile = { ...prev, ...newProfile }
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedProfile))
      return updatedProfile
    })
  }

  const clearProfile = () => {
    setProfile({ userName: '' })
    localStorage.removeItem(LOCAL_STORAGE_KEY)
  }

  return (
    <UserProfileReactContext.Provider value={{ profile, updateProfile, clearProfile, profileReady }}>
      {children}
    </UserProfileReactContext.Provider>
  )
}
