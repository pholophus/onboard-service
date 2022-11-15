import { IOnboardingServiceDef } from "../_aqua/onboarding_service";
import { ArcadeDetail, StatusMessage, LocationDetail, onboardInput } from "../interface";
import mongodb from '../database/mongodb.database';
import {AssetMetadataModule} from '../modules/assetMetadata.module'
import * as driver from 'bigchaindb-driver'
import * as zoneGameDetail from "../data/zoneGameDetail.json";
import * as arcadeSize from "../data/arcadeSize.json";
import { ObjectId } from 'mongodb'



export class OnboardingService implements IOnboardingServiceDef {

    private fetchedLocation: any
    private zoneGameDetail = zoneGameDetail

    // async list_of_games(walletAddress: string): Promise<ArcadeDetail[]>{

    //     const response = []
    //     const mongo = new mongodb()

    //     await mongo.connectDB()

    //     const arcadeModel = await mongo.arcade()

    //     let arcadeGames = await arcadeModel.find({walletAddress: walletAddress}).toArray()

    //     // db.collection.aggregate([
    //     //     {
    //     //       $match: {
    //     //         zone: "arcade",
    //     //         "machineDetail.wallet": 1
    //     //       }
    //     //     },
    //     //     {
    //     //       $project: {
    //     //         zone: 1,
    //     //         userDetail: {
    //     //           $filter: {
    //     //             input: "$machineDetail",
    //     //             as: "a",
    //     //             cond: {
    //     //               $eq: [
    //     //                 "$$a.wallet",
    //     //                 1
    //     //               ]
    //     //             }
    //     //           }
    //     //         }
    //     //       }
    //     //     },
    //     //     {
    //     //       $unwind: "$userDetail"
    //     //     },
    //     //     {
    //     //       $project: {
    //     //         gameDetail: "$userDetail",
    //     //         _id: 0
    //     //       }
    //     //     }
    //     //   ])

    //     return response
    // }

    /**
   * Get location available for game
   * @returns detail of arcade
   */
  async get_location_game(OnboardInput: onboardInput): Promise<ArcadeDetail> {

    const statusMessage: StatusMessage = {
        status_code: 200,
        success: true,
        message: "Game successfully deployed.",
    }

    const arcadeDetail: ArcadeDetail = {
        inputData: OnboardInput,
        x: 0,
        y: 0,
        location_id: "",
        status: statusMessage,
        width: arcadeSize[OnboardInput.arcadeSize].machine.width,
        height: arcadeSize[OnboardInput.arcadeSize].machine.height
    };

    return arcadeDetail

    try{
        const mongo = new mongodb()

        await mongo.connectDB()

        const arcadeModel = await mongo.arcade()

        if(process.env.LOCATION == "world-map"){
            // this.fetchedLocation = await arcadeModel.findOne({machineDetail: "", zone: "map"})
            this.fetchedLocation = await arcadeModel.findOne({ machineDetail: { $exists: true, $size: 0 }, zone: "world" })

            console.log({
                fetchedLocation: this.fetchedLocation
            })
            if(this.fetchedLocation == null){

                arcadeDetail.status = {
                    status_code: 200,
                    success: false,
                    message : "Currently no available location for arcade machine."
                }

                return arcadeDetail

            }

        }else{

            var detailHighestLevel = await arcadeModel.findOne({ zone: "arcade"})

            var highestLevel = `machineDetail.${detailHighestLevel.machineDetail.length - 1}`;

            this.fetchedLocation = await arcadeModel.findOne({ zone: "arcade", highestLevel: {$exists: true}})

            if(this.fetchedLocation == null){

                this.fetchedLocation.x = detailHighestLevel.x
                this.fetchedLocation.y = detailHighestLevel.y
                this.fetchedLocation._id = detailHighestLevel._id

            }

        } 
        
        arcadeDetail.x = parseInt(this.fetchedLocation.x)
        arcadeDetail.y = parseInt(this.fetchedLocation.y)
        arcadeDetail.location_id = this.fetchedLocation._id.toString()

    }catch(err){
        arcadeDetail.status.status_code = 505
        arcadeDetail.status.message = "Something wrong with database";
        arcadeDetail.status.success = false;
    }

    console.log({
        returnArcadeDetail: arcadeDetail
    })

    return arcadeDetail
  }

  /**
   * Insert data to bigchainDB
   */
  async insert_arcade_building(arcadeDetail: ArcadeDetail): Promise<LocationDetail>{
    
    console.log({
        arcadeDetail: arcadeDetail
    })

    let locationDetail: LocationDetail = {
        buildingId: "",
        locationId: arcadeDetail.location_id,
        status: arcadeDetail.status,
        wallet: arcadeDetail.inputData.wallet
    }

    try {

        const assetData = new AssetMetadataModule()

        let type = process.env.LOCATION == "world-map" ? this.zoneGameDetail.worldMap.type : this.zoneGameDetail.arcade.type

        let zoneId = process.env.LOCATION == "world-map" ? this.zoneGameDetail.worldMap.zoneId : this.zoneGameDetail.arcade.zoneId

        let data = assetData.createAssetMetadata(arcadeDetail, type, zoneId)

        const txCreatePaint = driver.Transaction.makeCreateTransaction(
            data.asset,
            data.metadata,
            [
                driver.Transaction.makeOutput(
                    driver.Transaction.makeEd25519Condition(process.env.PUBLICKEY),
                ),
            ],
            process.env.PUBLICKEY,
        )

        const txSigned = driver.Transaction.signTransaction(txCreatePaint, process.env.PRIVATEKEY)

        const conn = new driver.Connection('https://httpsbigchain.appserver.projectoasis.io/api/v1/')

        // const assetCreated: any = ""
        const assetCreated = await conn.postTransactionCommit(txSigned)

        locationDetail.buildingId = assetCreated.id

    } catch (error) {

        locationDetail.status.status_code = 505
        locationDetail.status.message = error
        locationDetail.status.success = false

    }

    console.log({
        locationDetail: locationDetail
    })

    return locationDetail

  }

  /**
   * Insert data to bigchainDB
   */
   async update_mongodb_location(locationDetail: LocationDetail): Promise<StatusMessage>{
    
    console.log({
        locationDetail: locationDetail
    })

    try{
        const mongo = new mongodb()

        await mongo.connectDB()

        const arcadeModel = await mongo.arcade()
        var ObjectId = require('mongodb').ObjectID;

        await arcadeModel.updateOne({
            _id: ObjectId(locationDetail.locationId)
        }, {
            $push: { 
                machineDetail: {
                    wallet: locationDetail.wallet,
                    machine: locationDetail.buildingId
                }
            }
        })

    }catch(err){
        console.log("update err", err)
        locationDetail.status.message = err;
        locationDetail.status.status_code = 505;
        locationDetail.status.success = false;
    }

    console.log({
        status: locationDetail.status
    })

    return locationDetail.status

  }
}