import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ViewGroup } from '../../libs/enums/view.enum';
import { AuthService } from '../auth/auth.service';
import { ViewService } from '../view/view.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Property } from '../../libs/dto/property/property';
import { PropertyInput } from '../../libs/dto/property/property.input';
import { Message } from '../../libs/enums/common.enum';
import { MemberService } from '../member/member.service';
import { PropertyStatus } from '../../libs/enums/property.enum';
import { StatisticModifier, T } from '../../libs/types/common';
import { PropertyUpdate } from '../../libs/dto/property/property.update';
import moment from 'moment';


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

    public async getProperty(memberId: ObjectId, propertyId: ObjectId): Promise<Property> {
        const search: T = {
            _id: propertyId,
            propertyStatus: PropertyStatus.ACTIVE,
        };

        const targetProperty = await this.propertyModel.findOne(search).lean().exec() as Property | null;
        if (!targetProperty) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

        if (memberId) {
            const viewInput = { memberId: memberId, viewRefId: propertyId, viewGroup: ViewGroup.PROPERTY }
            const newView = await this.viewService.recordView(viewInput);
            if (newView) {
                await this.propertyStatsEditor({ _id: propertyId, targetKey: 'propertyViews', modifier: 1 });
                targetProperty.propertyViews ++;
            }

            // meLiked
        }
        targetProperty.memberData = await this.memberService.getMember(undefined, targetProperty.memberId);
        return targetProperty;
    }

    public async propertyStatsEditor(input: StatisticModifier): Promise<Property> {
        const { _id, targetKey, modifier } = input;
        const result = await this.propertyModel
            .findByIdAndUpdate(
                _id, 
                { $inc: { [targetKey]: modifier } }, 
                { new: true }
            )
            .exec();
        if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);
        return result;
    }

    public async updateProperty(memberId: ObjectId, input: PropertyUpdate): Promise<Property> {
        let { propertyStatus, soldAt, deletedAt } = input;
        const search: T = {
            _id: input._id,
            memberId: memberId,
            propertyStatus: PropertyStatus.ACTIVE,
        };
        if (propertyStatus === PropertyStatus.SOLD) soldAt = moment().toDate();
        if (propertyStatus === PropertyStatus.DELETE) deletedAt = moment().toDate();
       
        const result = await this.propertyModel
            .findOneAndUpdate( search, input,
                { new: true }
            )
            .exec();
        if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

        if (soldAt || deletedAt) {
            // decrease memberProperties
            await this.memberService.memberStatsEditor({
                _id: memberId,
                targetKey: 'memberProperties',
                modifier: -1,
            });
        }

        return result;  
    }
}
