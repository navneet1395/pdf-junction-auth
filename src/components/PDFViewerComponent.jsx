import React, { useState, useEffect } from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
  pdf,
} from "@react-pdf/renderer";
import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";

// Register Hindi Font
Font.register({
  family: "Noto Sans Devanagari",
  src: "/fonts/NotoSansDevanagari-Regular.ttf",
});
const styles = StyleSheet.create({
  page: {
    padding: 20,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  body: {
    height: "70%",
    margin: 20,
    border: "1px solid black",
    fontFamily: "Noto Sans Devanagari",
    fontSize: 8,
  },
  footer: {
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    fontSize: 10,
  },

  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 10,
  },
  topSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 10,
  },
  title: {
    fontSize: 14,
    margin: 5,
    fontWeight: 400,
  },
  middleSection: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 10,
  },
  boldLabel: { fontWeight: 600 },
});

const HindiDocument = ({ data }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View>
          <View style={styles.navbar}>
            <Text>{new Date().toLocaleString("en-IN")}</Text>
            <Text>Anugya-Patra</Text>
            <Text></Text>
          </View>
          <View style={styles.body}>
            <iv style={styles.topSection}>
              <Text>मूल प्रति</Text>
              
              <View style={styles.middleSection}>
                <Text>"केवल राज्य के बाहर उपयोग हेतु "</Text>
                <Text style={styles.title}>अनुज्ञा-पत्र</Text>
                <Text style={styles.boldLabel}>
                  कृषि उपज मंडी समिति - {data?.marketPlace || "Dabra"}
                </Text>
                <Text style={styles.label}>
                  जिला -{" "}
                  <Text style={styles.boldLabel}>
                    {data?.marketDistrict || "Gwalior"}
                  </Text>
                </Text>
                <Text style={styles.label}>
                  अधिनियम की धारा-19(6) तथा उपविधि 20(10)
                </Text>
                <Text style={styles.boldLabel}>
                  (मूल मंडी क्षेत्र अथवा मंडी प्रांगण से माल बाहर ले जाने के
                  लिये)
                </Text>
              </View>
              <View></View>
              {/* A Qr to be displayed  */}
            </View>
          </View>
        </View>
        <View style={styles.footer}>
          <Text>https://eanugya.mp.gov.in/Trader.aspx </Text>
          <Text>1/1</Text>
        </View>
      </Page>
    </Document>
  );
};

const PDFViewerComponent = ({ data }) => {
  return (
    <>
      <div className="pdf-viewer">
        <PDFViewer width="100%" height="700px">
          <HindiDocument data={data} />
        </PDFViewer>
      </div>

      <div className="download-button">
        <PDFDownloadLink
          document={<HindiDocument data={data} />}
          fileName="anugya-patra.pdf"
          className="download-link"
        >
          {({ blob, url, loading, error }) =>
            loading ? "PDF Loading..." : "Download PDF"
          }
        </PDFDownloadLink>
      </div>
    </>
  );
};
export default PDFViewerComponent;
