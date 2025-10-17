import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import * as PDFKit from 'pdfkit';

interface ExportMember {
  name: string;
  email?: string | null;
  phone: string;
  gender: string;
  address: string;
  birthDate?: Date | null;
  status: string;
  conversionStatus?: string | null;
  ageRange?: string | null;
  educationLevel?: string | null;
  interests?: string[] | null;
  sundayAttendance: number;
  prayerRequest?: string | null;
  badComment?: string | null;
  firstVisit?: Date | null;
  lastVisit?: Date | null;
  zone?: { name: string } | null;
  cell?: { name: string } | null;
}

@Injectable()
export class MemberExportService {
  /**
   * Export members to Excel
   */
  async exportToExcel(members: ExportMember[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Members');

    // Define columns
    worksheet.columns = [
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Phone', key: 'phone', width: 20 },
      { header: 'Gender', key: 'gender', width: 12 },
      { header: 'Address', key: 'address', width: 35 },
      { header: 'Birthday', key: 'birthday', width: 20 },
      { header: 'Zone', key: 'zone', width: 20 },
      { header: 'Cell', key: 'cell', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Conversion Status', key: 'conversionStatus', width: 20 },
      { header: 'Age Range', key: 'ageRange', width: 15 },
      { header: 'Education Level', key: 'educationLevel', width: 20 },
      { header: 'Areas of Interest', key: 'interests', width: 30 },
      { header: 'Sunday Attendance', key: 'sundayAttendance', width: 18 },
      { header: 'Prayer Request', key: 'prayerRequest', width: 40 },
      { header: 'Additional Notes', key: 'additionalNotes', width: 40 },
      { header: 'First Visit', key: 'firstVisit', width: 15 },
      { header: 'Last Visit', key: 'lastVisit', width: 15 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true, size: 12 };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF9DBF26' },
    };
    worksheet.getRow(1).alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };

    // Add data rows
    members.forEach((member) => {
      worksheet.addRow({
        name: member.name,
        email: member.email || 'N/A',
        phone: member.phone,
        gender: this.formatEnumValue(member.gender),
        address: member.address,
        birthday: this.formatBirthday(member.birthDate),
        zone: member.zone?.name || 'N/A',
        cell: member.cell?.name || 'N/A',
        status: this.formatEnumValue(member.status),
        conversionStatus: this.formatEnumValue(member.conversionStatus),
        ageRange: this.formatEnumValue(member.ageRange),
        educationLevel: this.formatEnumValue(member.educationLevel),
        interests: this.formatInterests(member.interests),
        sundayAttendance: member.sundayAttendance || 0,
        prayerRequest: member.prayerRequest || 'N/A',
        additionalNotes: member.badComment || 'N/A',
        firstVisit: member.firstVisit ? this.formatDate(member.firstVisit) : 'N/A',
        lastVisit: member.lastVisit ? this.formatDate(member.lastVisit) : 'N/A',
      });
    });

    // Auto-filter
    worksheet.autoFilter = {
      from: 'A1',
      to: 'R1',
    };

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Export members to PDF
   */
  async exportToPDF(members: ExportMember[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFKit({ size: 'A4', layout: 'landscape', margin: 30 });
      const chunks: any[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Title
      doc.fontSize(18).font('Helvetica-Bold').text('Members Export', { align: 'center' });
      doc.moveDown();

      // Metadata
      doc
        .fontSize(10)
        .font('Helvetica')
        .text(`Total Records: ${members.length}`, { align: 'left' });
      doc.text(`Generated: ${new Date().toLocaleString()}`, { align: 'left' });
      doc.moveDown();

      // Table header
      const tableTop = doc.y;
      const colWidths = [120, 150, 100, 80, 200, 100, 100];
      const headers = ['Name', 'Email', 'Phone', 'Gender', 'Address', 'Zone', 'Cell'];

      doc.fontSize(9).font('Helvetica-Bold');
      let xPos = 30;
      headers.forEach((header, i) => {
        doc.text(header, xPos, tableTop, {
          width: colWidths[i],
          align: 'left',
        });
        xPos += colWidths[i];
      });

      doc.moveDown(0.5);
      doc
        .moveTo(30, doc.y)
        .lineTo(30 + colWidths.reduce((a, b) => a + b, 0), doc.y)
        .stroke();

      // Table rows
      doc.fontSize(8).font('Helvetica');
      members.forEach((member, index) => {
        if (doc.y > 500) {
          // Add new page if needed
          doc.addPage({ size: 'A4', layout: 'landscape', margin: 30 });
          doc.fontSize(9).font('Helvetica-Bold');
          xPos = 30;
          headers.forEach((header, i) => {
            doc.text(header, xPos, doc.y, {
              width: colWidths[i],
              align: 'left',
            });
            xPos += colWidths[i];
          });
          doc.moveDown(0.5);
          doc.fontSize(8).font('Helvetica');
        }

        const rowY = doc.y;
        xPos = 30;

        const rowData = [
          member.name,
          member.email || 'N/A',
          member.phone,
          this.formatEnumValue(member.gender),
          member.address || 'N/A',
          member.zone?.name || 'N/A',
          member.cell?.name || 'N/A',
        ];

        // Calculate row height based on longest text
        let maxRowHeight = 12; // Default row height

        rowData.forEach((data, i) => {
          const textHeight = doc.heightOfString(String(data), {
            width: colWidths[i],
            align: 'left',
          });
          maxRowHeight = Math.max(maxRowHeight, textHeight);
        });

        // Draw text with proper wrapping
        rowData.forEach((data, i) => {
          doc.text(String(data), xPos, rowY, {
            width: colWidths[i],
            align: 'left',
            lineGap: 2,
          });
          xPos += colWidths[i];
        });

        // Move down by the calculated row height
        doc.y += maxRowHeight + 4;

        // Alternate row background
        if (index % 2 === 0) {
          doc
            .rect(
              30,
              rowY - 2,
              colWidths.reduce((a, b) => a + b, 0),
              maxRowHeight + 4,
            )
            .fillOpacity(0.05)
            .fill('#000000')
            .fillOpacity(1);
        }
      });

      // Footer
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        doc.fontSize(8).text(`Page ${i + 1} of ${pageCount}`, 30, doc.page.height - 30, {
          align: 'center',
        });
      }

      doc.end();
    });
  }

  /**
   * Helper: Format enum values
   */
  private formatEnumValue(value: string | undefined | null): string {
    if (!value) return 'N/A';
    return value
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  /**
   * Helper: Format dates
   */
  private formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  /**
   * Helper: Format birthday as "6th October"
   */
  private formatBirthday(birthDate: Date | null | undefined): string {
    if (!birthDate) return 'N/A';

    const date = new Date(birthDate);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'long' });

    // Add ordinal suffix (1st, 2nd, 3rd, 4th, etc.)
    const getOrdinalSuffix = (day: number): string => {
      if (day >= 11 && day <= 13) return 'th';
      switch (day % 10) {
        case 1:
          return 'st';
        case 2:
          return 'nd';
        case 3:
          return 'rd';
        default:
          return 'th';
      }
    };

    return `${day}${getOrdinalSuffix(day)} ${month}`;
  }

  /**
   * Helper: Format interests array as comma-separated string
   */
  private formatInterests(interests: string[] | null | undefined): string {
    if (!interests || interests.length === 0) return 'N/A';

    return interests
      .map((interest) =>
        interest
          .replace(/_/g, ' ')
          .toLowerCase()
          .replace(/\b\w/g, (c) => c.toUpperCase()),
      )
      .join(', ');
  }
}
