import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import type { BoardArticle } from '../../libs/dto/board-article/board-article';

@Injectable()
export class BoardArticleService {
    constructor(@InjectModel("BoardArticle") private readonly boardArticleModel: Model<BoardArticle>) {}
}
