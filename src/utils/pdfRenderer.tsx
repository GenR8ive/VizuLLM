import React from 'react';
import { Document, Page, View, Text, StyleSheet, Image, pdf } from '@react-pdf/renderer';

interface PdfComponentProps {
  title: string;
  componentImageData: string;
  pageSize: {
    width: number;
    height: number;
    unit: string;
  };
}

// Create styles for the PDF
const styles = StyleSheet.create({
  page: {
    backgroundColor: 'white',
    padding: 30,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333333',
  },
  imageContainer: {
    flex: 1,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    maxWidth: '100%',
    maxHeight: '80%',
    objectFit: 'contain',
  },
  footer: {
    fontSize: 10,
    color: '#666666',
    marginTop: 20,
    textAlign: 'center',
  },
});

// PDF Document Component
const PDFDocument: React.FC<PdfComponentProps> = ({ title, componentImageData, pageSize }) => {
  // Convert page size based on unit
  let pdfPageSize: 'A4' | [number, number] = 'A4'; // Default fallback

  if (pageSize.unit === 'mm') {
    // Convert mm to points (1mm = 2.834645669 points)
    const widthInPoints = pageSize.width * 2.834645669;
    const heightInPoints = pageSize.height * 2.834645669;
    pdfPageSize = [widthInPoints, heightInPoints];
  } else if (pageSize.unit === 'in') {
    // Convert inches to points (1 inch = 72 points)
    const widthInPoints = pageSize.width * 72;
    const heightInPoints = pageSize.height * 72;
    pdfPageSize = [widthInPoints, heightInPoints];
  } else if (pageSize.unit === 'px') {
    // Assume 96 DPI for pixel conversion (1 inch = 96 pixels = 72 points)
    const widthInPoints = (pageSize.width / 96) * 72;
    const heightInPoints = (pageSize.height / 96) * 72;
    pdfPageSize = [widthInPoints, heightInPoints];
  }

  return (
    <Document>
      <Page
        size={pdfPageSize}
        style={styles.page}
      >
        <Text style={styles.title}>{title}</Text>
        <View style={styles.imageContainer}>
          <Image
            src={componentImageData}
            style={styles.image}
          />
        </View>
        <Text style={styles.footer}>
          Generated on {new Date().toLocaleDateString()}
        </Text>
      </Page>
    </Document>
  );
};

// Function to generate and download PDF
export const generatePDF = async (
  title: string,
  componentImageData: string,
  pageSize: { width: number; height: number; unit: string },
  filename: string
): Promise<void> => {
  try {
    const doc = <PDFDocument
      title={title}
      componentImageData={componentImageData}
      pageSize={pageSize}
    />;

    const blob = await pdf(doc).toBlob();

    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('PDF export completed using @react-pdf/renderer');
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw error;
  }
};

export default PDFDocument;
