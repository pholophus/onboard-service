import { Fluence, KeyPair } from '@fluencelabs/fluence';
import { krasnodar } from '@fluencelabs/fluence-network-environment';
import { registerIOnboardingService } from './_aqua/onboarding_service';
import { OnboardingService } from './service/onboarding-service';
// import FluenceController from "./controller/fluence-controller"
// import { get_user_nfts } from './_aqua/metadata_service'

const relay = krasnodar[8];
const skBytes = 'TXhiHMMi4nHeEmkLNXNO/ilSzmZ16eN8LhNMFYYEvDU=';

export async function runServer() {
    await Fluence.start({
        connectTo: relay,
        KeyPair: await KeyPair.fromEd25519SK(Buffer.from(skBytes, 'base64')),
    });

    //12D3KooWDTNLoW2YKUvCcnhdAUyhhm6m9EKLvzstDRxXrbqwentc

    registerIOnboardingService(new OnboardingService());

    console.log('application started');
    console.log('peer id is: ', Fluence.getStatus().peerId);
    console.log('relay address: ', relay.multiaddr);
    console.log('relay is: ', Fluence.getStatus().relayPeerId);

}