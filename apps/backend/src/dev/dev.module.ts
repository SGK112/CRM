import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DevController } from './dev.controller';
import { DevService } from './dev.service';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Client, ClientSchema } from '../clients/schemas/client.schema';
import { Project, ProjectSchema } from '../projects/schemas/project.schema';
import { Appointment, AppointmentSchema } from '../appointments/schemas/appointment.schema';
import { Estimate, EstimateSchema } from '../estimates/schemas/estimate.schema';
import { Invoice, InvoiceSchema } from '../invoices/schemas/invoice.schema';
import { Notification, NotificationSchema } from '../notifications/schemas/notification.schema';
import { Media, MediaSchema } from '../media/schemas/media.schema';
import { Design, DesignSchema } from '../designs/schemas/design.schema';
import { DesignRevision, DesignRevisionSchema } from '../designs/schemas/design-revision.schema';
import { Employee, EmployeeSchema } from '../hr/schemas/employee.schema';
import { Invitation, InvitationSchema } from '../invitations/schemas/invitation.schema';
import { ShareLink, ShareLinkSchema } from '../share-links/schemas/share-link.schema';
import { VoiceCall, VoiceCallSchema } from '../voice-agent/schemas/voice-call.schema';
import { AiTokenBalance, AiTokenBalanceSchema } from '../ai-tokens/schemas/ai-token-balance.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Client.name, schema: ClientSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: Appointment.name, schema: AppointmentSchema },
      { name: Estimate.name, schema: EstimateSchema },
      { name: Invoice.name, schema: InvoiceSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: Media.name, schema: MediaSchema },
      { name: Design.name, schema: DesignSchema },
      { name: DesignRevision.name, schema: DesignRevisionSchema },
      { name: Employee.name, schema: EmployeeSchema },
      { name: Invitation.name, schema: InvitationSchema },
      { name: ShareLink.name, schema: ShareLinkSchema },
      { name: VoiceCall.name, schema: VoiceCallSchema },
      { name: AiTokenBalance.name, schema: AiTokenBalanceSchema },
    ]),
  ],
  controllers: [DevController],
  providers: [DevService],
})
export class DevModule {}
