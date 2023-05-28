import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {

    constructor(
    ) { }

    async findOne(steamId: string): Promise<any | undefined> {
        // FIXME: Not working because got rid of MongoDB where users were stored previously
        // return this.userModel.findOne({ steamId });
    }

    async createOrUpdate(steamProfile: any): Promise<any | undefined> {
        // Creating new user DTO
        const newUser = {
            steamId: steamProfile.id,
            displayName: steamProfile.displayName,
            // Taking "full" version of photo. If not present then trying first available photo.
            // If none of them were found then setting as null cause there is no photo
            photoUrl: steamProfile.photos[2]?.value ?? steamProfile.photos[0]?.value ?? null,
        };

        // FIXME: Not working because got rid of MongoDB where users were stored previously

        // // Creating or updating steam profile
        // const userInDB = await this.userModel.findOneAndUpdate({ steamId: steamProfile.id }, newUser,
        //     {
        //         upsert: true,
        //         // Src: https://stackoverflow.com/a/54945446/5347059
        //         lean: true,
        //         useFindAndModify: false,
        //         // We need updated value
        //         new: true,
        //     });

        // // Returning newly added or updated user info
        // return userInDB as SteamUser;
        return undefined;
    }
}
