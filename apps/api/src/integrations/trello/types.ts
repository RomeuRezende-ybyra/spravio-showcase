// Trello API response types

export interface TrelloBoard {
  id: string
  name: string
  desc: string
  closed: boolean
  url: string
  shortUrl: string
}

export interface TrelloList {
  id: string
  name: string
  closed: boolean
  pos: number
  idBoard: string
}

export interface TrelloCard {
  id: string
  name: string
  desc: string
  closed: boolean
  pos: number
  due: string | null
  dueComplete: boolean
  idBoard: string
  idList: string
  idMembers: string[]
  labels: TrelloLabel[]
  url: string
  shortUrl: string
}

export interface TrelloLabel {
  id: string
  idBoard: string
  name: string
  color: string | null
}

export interface TrelloMember {
  id: string
  username: string
  fullName: string
  avatarUrl: string | null
  email?: string
}

export interface TrelloChecklist {
  id: string
  name: string
  idBoard: string
  idCard: string
  checkItems: TrelloCheckItem[]
}

export interface TrelloCheckItem {
  id: string
  name: string
  state: 'complete' | 'incomplete'
  pos: number
}
