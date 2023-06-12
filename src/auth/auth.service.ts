import {ForbiddenException, Injectable} from "@nestjs/common";
import {PrismaService} from "../prisma/prisma.service";
import {PrismaClientKnownRequestError} from '@prisma/client/runtime';
import {AuthDto} from "./dto";
import * as argon from 'argon2';

// A service will handle the business logic and data persistence.
@Injectable({})
export class AuthService {
    constructor(private prisma: PrismaService) {
    }

    async signup(dto: AuthDto) {
        // Generate a hash of the password
        const hash = await argon.hash(dto.password);

        try {
            // Save the hash in the database
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    hash
                }
            });
            // Remove the hash from the user object
            delete user.hash;
            // Return the saved user
            return user;
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new ForbiddenException(
                        'Credentials taken',
                    );
                }
            }
            throw error;
        }
    }

    async signin(dto: AuthDto) {
        // Find the user by email
        const user =
            await this.prisma.user.findUnique({
                where: {
                    email: dto.email,
                },
            });

        // If user does not exist throw exception
        if (!user)
            throw new ForbiddenException(
                'Credentials incorrect',
            );

        // Compare passwords
        const pwMatches = await argon.verify(
            user.hash,
            dto.password,
        );

        // If password incorrect throw exception
        if (!pwMatches)
            throw new ForbiddenException(
                'Credentials incorrect',
            );

        const {id, email} = user;
        return {id, email};
    }
}