import {Body, Controller, HttpCode, HttpStatus, Post, Req} from '@nestjs/common';
import {AuthService} from "./auth.service";
import {AuthDto} from "./dto";

// A controller is responsible for handling incoming requests and returning responses to the client.
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {
    }

    @HttpCode(HttpStatus.CREATED)
    @Post('signup')
    signup(@Body() dto: AuthDto) {
        return this.authService.signup(dto);
    }

    @HttpCode(HttpStatus.OK)
    @Post('signin')
    signin(@Body() dto: AuthDto) {
        return this.authService.signin(dto);
    }
}