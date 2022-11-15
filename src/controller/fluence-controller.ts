import { Fluence } from '@fluencelabs/fluence';
import { krasnodar } from '@fluencelabs/fluence-network-environment';
import { get_location_arcade } from '../_aqua/onboarding_service'

export default class FluenceController {

  constructor() {
  }

  async getLocationArcade() {
    
    try{
    //   console.log(`enter get nfts ---> ${profileId}`)
      return await get_user_nfts(profileId)

    }catch(e){
      return e
    }
    
  }
  
}