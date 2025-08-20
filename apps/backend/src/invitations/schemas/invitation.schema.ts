import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type InvitationDocument = Invitation & Document;

@Schema({ timestamps: true })
export class Invitation {
  @Prop({ required: true })
  workspaceId: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  role: string; // role to grant upon acceptance

  @Prop({ required: true })
  token: string; // random secret

  @Prop({ required: true })
  expiresAt: Date;

  @Prop()
  acceptedAt?: Date;

  @Prop({ required: true })
  createdBy: string; // user id of inviter
}

export const InvitationSchema = SchemaFactory.createForClass(Invitation);

InvitationSchema.index({ workspaceId: 1, email: 1, acceptedAt: 1 });
InvitationSchema.index({ token: 1 }, { unique: true });
