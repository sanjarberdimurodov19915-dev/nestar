import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { ViewService } from '../view/view.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Property } from '../../libs/dto/property/property';
import { PropertyInput } from '../../libs/dto/property/property.input';
import { Message } from '../../libs/enums/common.enum';
import { MemberService } from '../member/member.service';


@Injectable()
export class PropertyService {
    constructor(@InjectModel('Property') private readonly propertyModel: Model<Property>,
    private memberService: MemberService,
    private authService: AuthService,
    private viewService: ViewService,
    ) {}

    public async createProperty(input: PropertyInput): Promise<Property> {
        console.log('Service: createProperty');
        try {
            const result = await this.propertyModel.create(input);
            // increase memberProperties
            await this.memberService.memberStatsEditor({
                _id: input.memberId,
                targetKey: 'memberProperties',
                modifier: 1,
            });
            return result;  
        } catch (err) {
            console.log('Error, Service.model:', err.message);
            throw new BadRequestException(Message.CREATE_FAILED);
        } 
    }
}
