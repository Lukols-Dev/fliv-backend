import type {
  TransportOrder as PrismaTransportOrder,
  OrderDocument as PrismaTransportOrderDocument,
  Document as PrismaDocument,
} from 'generated/prisma/client';
import { TransportOrder } from '../../domain/entities/transport-order.entity';
import { TransportOrderId } from '../../domain/value-objects/transport-order-id.vo';
import { TransportOrderStatus } from '../../domain/value-objects/transport-order-status.vo';
import { TransportOrderDocument } from '../../domain/entities/transport-order-document.entity';
import { TransportOrderDocumentId } from '../../domain/value-objects/transport-order-document-id.vo';

type TransportOrderWithDocuments = PrismaTransportOrder & {
  orderDocuments: (PrismaTransportOrderDocument & {
    document: PrismaDocument;
  })[];
};

export class TransportOrderMapper {
  static toDomain(record: TransportOrderWithDocuments): TransportOrder {
    const documents = record.orderDocuments.map(
      (orderDoc) =>
        new TransportOrderDocument(
          new TransportOrderDocumentId(orderDoc.id),
          orderDoc.document.url,
          orderDoc.document.mimeType,
          orderDoc.document.sizeBytes ?? null,
          orderDoc.document.originalFilename ?? null,
          orderDoc.document.description ?? null,
        ),
    );

    return new TransportOrder(
      new TransportOrderId(record.id),
      record.ztNumber,
      record.pwNumber,
      record.status as TransportOrderStatus,
      record.vehiclePlate,
      record.trailerPlate,
      record.driverFirstName,
      record.driverLastName,
      record.driverPhone,
      record.clientName,
      record.contractNumber,
      record.payerName,
      record.payerVatId,
      record.payerEmail,
      record.fromCountry,
      record.toCountry,
      record.cargoWeightKg,
      record.loadingDate,
      record.cargoDescription,
      record.temperatureSensitive,
      record.notes,
      record.createdByUserId,
      record.assignedDriverUserId ?? null,
      record.createdAt,
      record.updatedAt,
      documents,
    );
  }
}
