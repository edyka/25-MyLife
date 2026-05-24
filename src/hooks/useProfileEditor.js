import { useState, useEffect } from 'react'
import { useLifeStore } from '../stores/useLifeStore'
import { auth, database } from '../lib/supabase'

export const useProfileEditor = () => {
  const birthDay = useLifeStore(state => state.birthDay)
  const birthMonth = useLifeStore(state => state.birthMonth)
  const birthYear = useLifeStore(state => state.birthYear)
  const lifeExpectancy = useLifeStore(state => state.lifeExpectancy)
  const userName = useLifeStore(state => state.userName)

  const setBirthData = useLifeStore(state => state.setBirthData)
  const setLifeExpectancy = useLifeStore(state => state.setLifeExpectancy)
  const setUserName = useLifeStore(state => state.setUserName)

  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(userName || '')
  const [editDay, setEditDay] = useState(birthDay || 1)
  const [editMonth, setEditMonth] = useState(birthMonth || 1)
  const [editYear, setEditYear] = useState(birthYear || 2000)
  const [editExpectancy, setEditExpectancy] = useState(lifeExpectancy || 80)

  useEffect(() => {
    setEditName(userName || '')
    setEditDay(birthDay || 1)
    setEditMonth(birthMonth || 1)
    setEditYear(birthYear || 2000)
    setEditExpectancy(lifeExpectancy || 80)
  }, [userName, birthDay, birthMonth, birthYear, lifeExpectancy])

  const saveProfile = async () => {
    const day = editDay || 1
    const month = editMonth || 1
    const year = editYear || 2000
    const expectancy = editExpectancy || 80
    const name = editName || ''

    setBirthData(day, month, year)
    setLifeExpectancy(expectancy)
    setUserName(name)
    setIsEditing(false)

    try {
      const { user } = await auth.getCurrentUser()
      if (user) {
        await database.saveUserProfile(user.id, {
          name: name,
          birthDay: day,
          birthMonth: month,
          birthYear: year,
          lifeExpectancy: expectancy,
        })
      }
    } catch (error) {
      console.error('[ProfileEditor] Error syncing to Supabase:', error)
    }
  }

  const cancelEdit = () => {
    setEditName(userName || '')
    setEditDay(birthDay || 1)
    setEditMonth(birthMonth || 1)
    setEditYear(birthYear || 2000)
    setEditExpectancy(lifeExpectancy || 80)
    setIsEditing(false)
  }

  return {
    isEditing,
    setIsEditing,
    editName,
    setEditName,
    editDay,
    setEditDay,
    editMonth,
    setEditMonth,
    editYear,
    setEditYear,
    editExpectancy,
    setEditExpectancy,
    saveProfile,
    cancelEdit,
    userName,
    birthDay,
    birthMonth,
    birthYear,
    lifeExpectancy,
  }
}
