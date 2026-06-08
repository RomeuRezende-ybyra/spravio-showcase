import { trelloRequest } from './client.js'
import type { TrelloBoard, TrelloList, TrelloCard, TrelloMember } from './types.js'

/**
 * Get all boards for the authenticated user
 */
export async function getBoards(): Promise<TrelloBoard[]> {
  return trelloRequest<TrelloBoard[]>('/members/me/boards?filter=open')
}

/**
 * Get a specific board by ID
 */
export async function getBoard(boardId: string): Promise<TrelloBoard> {
  return trelloRequest<TrelloBoard>(`/boards/${boardId}`)
}

/**
 * Get all lists (columns) for a board
 */
export async function getBoardLists(boardId: string): Promise<TrelloList[]> {
  return trelloRequest<TrelloList[]>(`/boards/${boardId}/lists?filter=open`)
}

/**
 * Get all cards for a board
 */
export async function getBoardCards(boardId: string): Promise<TrelloCard[]> {
  return trelloRequest<TrelloCard[]>(
    `/boards/${boardId}/cards?fields=id,name,desc,closed,pos,due,dueComplete,idBoard,idList,idMembers,labels,url,shortUrl`
  )
}

/**
 * Get all members of a board
 */
export async function getBoardMembers(boardId: string): Promise<TrelloMember[]> {
  return trelloRequest<TrelloMember[]>(`/boards/${boardId}/members?fields=id,username,fullName,avatarUrl`)
}

/**
 * Get cards for a specific list
 */
export async function getListCards(listId: string): Promise<TrelloCard[]> {
  return trelloRequest<TrelloCard[]>(`/lists/${listId}/cards`)
}

/**
 * Get a specific card by ID
 */
export async function getCard(cardId: string): Promise<TrelloCard> {
  return trelloRequest<TrelloCard>(`/cards/${cardId}`)
}
