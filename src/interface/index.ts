export interface ArcadeDetail {
    inputData: onboardInput
    x: number
    y: number
    location_id: string
    status: StatusMessage
    width: number
    height: number
}

export interface LocationDetail {
    buildingId: string
    locationId: string
    status: StatusMessage
    wallet: string
}


export interface StatusMessage{
    status_code: number
    success: boolean 
    message: string 
}

export interface onboardInput{
    banner: string
    wallet: string
    arcade: string
    screenshot: string[]
    gameName: string
    description: string
    developer: string
    youtube: string
    facebook: string
    instagram: string
    twitter: string
    linkedin: string
    genre: string[]
    gameURL: string
    arcadeSize: string
}