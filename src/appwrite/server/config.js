import {Client,Users,Databases} from 'node-appwrite'

const client = new Client()
    .setEndpoint(process.env.VITE_APPWRITE_URL)
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY)

export const users = new Client(client)
export const databases = new Databases(client)


