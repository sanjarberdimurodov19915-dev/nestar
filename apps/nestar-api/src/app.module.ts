import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { AppResolver } from './app.resolver';
import { ComponentsModule } from './components/components.module';
import { DatabaseModule } from './database/database.module';
import { T } from './libs/types/common';
import { response } from 'express';
import { SocketModule } from './socket/socket.module';
import { GraphQLFormattedError } from 'graphql';

@Module({
  imports: [
    ConfigModule.forRoot(), 
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      playground: true,
      uploads: false,
      autoSchemaFile: true,
     /* formatError: (error: T) => {
        // console.log('error:', error);
        const graphQLFormattedError = {
          code: error?.extensions.code,
          message: 
            error?.extensions?.exception?.response?.message || error?.extensions?.response?.message || error?.message,
        };
        console.log('GRAPHQL GLOBAL ERR:', graphQLFormattedError);
        return graphQLFormattedError;
      }, */

       formatError: (
  error: GraphQLFormattedError,
): GraphQLFormattedError => {
  const originalError = error.extensions?.originalError as
    | {
        message?: string | string[];
        error?: string;
        statusCode?: number;
        response?: {
          message?: string | string[];
          error?: string;
          statusCode?: number;
        };
      }
    | undefined;

  // Ba’zi exceptionlarda ma’lumot response ichida,
  // ValidationPipe xatosida esa to‘g‘ridan-to‘g‘ri originalError ichida bo‘ladi.
  const errorResponse = originalError?.response ?? originalError;

  const rawMessage =
    errorResponse?.message ??
    error.message ??
    'Internal server error';

  // GraphQL message string bo‘lishi kerak
  const message = Array.isArray(rawMessage)
    ? rawMessage.join(', ')
    : rawMessage;

  const statusCode =
    errorResponse?.statusCode ??
    (error.extensions?.statusCode as number | undefined) ??
    500;

  const code =
    (error.extensions?.code as string | undefined) ??
    (statusCode === 400 ? 'BAD_REQUEST' : 'INTERNAL_SERVER_ERROR');

  console.log('GRAPHQL ERROR:', {
    code,
    message,
    statusCode,
    path: error.path,
    locations: error.locations,
  });

  if (Array.isArray(rawMessage)) {
    console.log('VALIDATION ERRORS:', rawMessage);
  }

  return {
    message,
    locations: error.locations,
    path: error.path,

    extensions: {
      code,
      statusCode,

      // Frontendda har bir validation xabarini alohida olish uchun
      ...(Array.isArray(rawMessage) && {
        validationErrors: rawMessage,
      }),
    },
  };
},

    }), 
    ComponentsModule, 
    DatabaseModule, SocketModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppResolver],
})
export class AppModule {}
