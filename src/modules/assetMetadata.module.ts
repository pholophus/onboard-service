import { ArcadeDetail } from "../interface";

export class AssetMetadataModule {

    createAssetMetadata(arcadeDetail: ArcadeDetail, type:string, zoneId: string) {

        let data = {

            asset: {
                id: zoneId,
                type: type
            },
            metadata: {
                x: arcadeDetail.x,
                y: arcadeDetail.y,
                sprite: {
                    type: "image",
                    image: {
                        url: arcadeDetail.inputData.arcade,
                        frameWidth: arcadeDetail.width,
                        frameHeight: arcadeDetail.height,
                        scale: 1
                    }
                },
                link: {
                    type: "enter",
                    data: {
                        url: arcadeDetail.inputData.gameURL
                    }
                },
                others: {
                    banner: arcadeDetail.inputData.banner,
                    screenshot: arcadeDetail.inputData.screenshot,
                    gameName: arcadeDetail.inputData.gameName,
                    description: arcadeDetail.inputData.description,
                    developer: arcadeDetail.inputData.developer,
                    youtube:  arcadeDetail.inputData.youtube,
                    facebook: arcadeDetail.inputData.facebook,
                    instagram: arcadeDetail.inputData.instagram,
                    twitter: arcadeDetail.inputData.twitter,
                    linkedin: arcadeDetail.inputData.linkedin,
                    genre: arcadeDetail.inputData.genre
                }
            }
        }

        return data
    }
}