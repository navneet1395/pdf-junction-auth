import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { PDFFormData } from "@/types/pdf";
import { DEVANAGARI_FONT, registerPdfFonts } from "./fonts";

registerPdfFonts();

const styles = StyleSheet.create({
  page: { flexDirection: "column", backgroundColor: "#FFFFFF", padding: 20, fontFamily: DEVANAGARI_FONT },
  container: { padding: 6 },
  header: { fontSize: 12, textAlign: "center", marginBottom: 2, fontWeight: 700 },
  centerLabel: { fontSize: 10, textAlign: "center" },
  centerBold: { fontSize: 10, textAlign: "center", fontWeight: 700 },
  permitNumber: { fontSize: 10, marginTop: 6, marginBottom: 8, textAlign: "center" },
  row: { flexDirection: "row", flexWrap: "wrap", marginBottom: 4 },
  cell: { fontSize: 10, marginRight: 16 },
  label: { fontSize: 10 },
  boldLabel: { fontSize: 10, fontWeight: 700 },
  value: { fontWeight: 700 },
  note: { fontSize: 8, marginTop: 4, textAlign: "justify", lineHeight: 1.4 },
  horizontalLine: { borderBottomWidth: 1, borderBottomColor: "#000000", marginVertical: 6, width: "100%" },
  twoColumnSection: { flexDirection: "row", justifyContent: "space-between", width: "100%", marginTop: 4 },
  halfWidth: { width: "48%" },
  fullWidth: { width: "100%" },
  businessDetails: { marginTop: 4, marginBottom: 4 },
  formLocation: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  signature: { marginTop: 10, flexDirection: "row", justifyContent: "space-between" },
  signatureItem: { alignItems: "center" },
  signatureLine: { borderBottomWidth: 1, borderBottomColor: "#000000", width: 150, marginTop: 10, marginBottom: 4, alignSelf: "center" },
  footer: { marginTop: 10, fontSize: 8, textAlign: "center" },
});

const show = (v: string | number | null | undefined): string => {
  if (v === null || v === undefined) return "----";
  const s = String(v).trim();
  return s === "" ? "----" : s;
};

const num = (v: number | null | undefined): string =>
  v === null || v === undefined || Number.isNaN(v) ? "----" : String(v);

const formatDate = (iso: string): string => {
  if (!iso) return "----";
  const [y, m, d] = iso.split("-");
  return y && m && d ? `${d}/${m}/${y}` : iso;
};

const Field = ({ label, value }: { label: string; value: string }) => (
  <Text style={styles.cell}>
    {label}: <Text style={styles.value}>{value}</Text>
  </Text>
);

export interface AnugyaPatraDocumentProps {
  data: PDFFormData;
}

/** Printable Anugya-Patra (mandi transit permit), A4. */
const AnugyaPatraDocument = ({ data }: AnugyaPatraDocumentProps) => (
  <Document title={data.title || `Anugya-Patra ${data.permitNumber}`} language="hi">
    <Page size="A4" style={styles.page}>
      <View style={styles.container}>
        <Text style={styles.header}>"केवल राज्य के बाहर उपयोग हेतु"</Text>
        <Text style={styles.header}>मूल प्रति</Text>
        <Text style={styles.header}>अनुज्ञा-पत्र</Text>
        <Text style={styles.centerLabel}>कृषि उपज मंडी समिति - {show(data.marketPlace)}</Text>
        <Text style={styles.centerLabel}>जिला - {show(data.marketDistrict)}</Text>
        <Text style={styles.centerLabel}>अधिनियम की धारा-19(6) तथा उपविधि 20(10)</Text>
        <Text style={styles.centerBold}>(मूल मंडी क्षेत्र अथवा मंडी प्रांगण से माल बाहर ले जाने के लिये)</Text>

        <Text style={styles.permitNumber}>
          अनुज्ञा-पत्र क्रमांक : <Text style={styles.value}>{show(data.permitNumber)}</Text>
        </Text>

        <View style={styles.horizontalLine} />

        <View style={styles.row}>
          <Field label="1. कृषि उपज का नाम" value={show(data.cropName)} />
          <Field label="किस्म" value={show(data.cropVariety)} />
        </View>
        <View style={styles.row}>
          <Field label="2. कृषि उपज की मात्रा - नग संख्या" value={num(data.cropQuantityUnits)} />
          <Field label="कुल वजन (क्विंटल में)" value={num(data.totalWeight)} />
        </View>
        <View style={styles.row}>
          <Field label="3. कृषि उपज के स्वामी / विक्रेता का नाम" value={show(data.ownerName)} />
        </View>
        <View style={styles.row}>
          <Field label="4. वाहन का प्रकार" value={show(data.vehicleType)} />
          <Field label="वाहन क्रमांक" value={show(data.vehicleNumber)} />
        </View>
        <View style={styles.row}>
          <Field label="5. तौल कांटा का नाम एवं स्थान" value={show(data.weighingStation)} />
        </View>
        <View style={styles.row}>
          <Field label="6. तौल कांटा पर्ची नम्बर" value={show(data.weighingSlipNumber)} />
        </View>
        <View style={styles.row}>
          <Field label="7. वाहन चालक का नाम" value={show(data.driverName)} />
        </View>
        <View style={styles.row}>
          <Field label="8. जमा की गई मंडी फीस / अनुज्ञापत्र का विवरण" value={show(data.depositedMarketFee)} />
          <Field label="बाहर ले जाने का उद्देश्य" value={show(data.purposeOfTransport)} />
        </View>

        <View style={styles.horizontalLine} />

        <View style={styles.twoColumnSection}>
          <View style={styles.halfWidth}>
            <Text style={styles.boldLabel}>व्यापारी के लिये</Text>
            <View style={styles.businessDetails}>
              <Field label="अनुज्ञप्ति क्रमांक / मान नंबर" value={`${show(data.licenseNumber)} / ${show(data.manNumber)}`} />
              <Field label="मिल क्वालिटी" value={show(data.millQuality)} />
              <Field label="कृषि उपज का विवरण" value={show(data.cropDetails)} />
              <Field label="क्रय दिनांक" value={formatDate(data.purchaseDate)} />
              <Field label="कुल लाई गई मात्रा" value={num(data.totalBroughtQuantity)} />
              <Field label="वापिस ले जायी गई मात्रा" value={num(data.returnedQuantity)} />
              <Field label="वापिस ले जाने का कारण" value={show(data.returnReason)} />
            </View>
          </View>
          <View style={styles.halfWidth}>
            <Text style={styles.boldLabel}>कृषकों के लिये</Text>
            <View style={styles.businessDetails}>
              <Field label="कुल क्रय मात्रा (क्विंटल में)" value={num(data.totalPurchaseQuantity)} />
              <Field
                label="व्यापारी के पास इस अनुज्ञापत्र से निकासी के बाद शेष स्कंध वजन (क्विंटल में)"
                value={num(data.remainingStockWeight)}
              />
            </View>
          </View>
        </View>

        <View style={styles.horizontalLine} />

        <View style={styles.fullWidth}>
          <Field
            label="क्रेता व्यापारी / फर्म / स्थान, जहाँ कृषि उपज (विक्रय / प्रोसेसिंग) के उद्देश्य से ले जायी जानी है का नाम"
            value={show(data.buyerTraderName)}
          />
        </View>
        <View style={styles.row}>
          <Field label="जी.एस.टी. पंजीयन क्रमांक" value={show(data.gstNumber)} />
          <Field label="मान नंबर" value={show(data.buyerManNumber)} />
        </View>
        <View style={styles.row}>
          <Field label="मंडी समिति का जिला" value={show(data.marketDistrict)} />
          <Field label="मंडी समिति" value={show(data.marketCommittee)} />
          <Field label="जिला / प्रदेश" value={show(data.destinationState)} />
        </View>

        <View style={styles.fullWidth}>
          <Field
            label="गंतव्य / डिलीवरी क्रेता व्यापारी / फर्म / स्थान जहाँ कृषि उपज (विक्रय / प्रोसेसिंग) के उद्देश्य से भेजी जाना है का नाम"
            value={show(data.destTraderName)}
          />
        </View>
        <View style={styles.row}>
          <Field label="जी.एस.टी. पंजीयन क्रमांक" value={show(data.destGstNumber)} />
          <Field label="मान नंबर" value={show(data.destManNumber)} />
        </View>

        <Text style={styles.note}>
          (नोट - क्रेता व्यापारी को जारी इस अनुज्ञापत्र के आधार पर ही मंडी फीस से छूट का लाभ दिया जाकर गंतव्य /
          डिलीवरी क्रेता के पक्ष में यह अनुज्ञापत्र जारी किया गया है |)
        </Text>

        <View style={styles.horizontalLine} />

        <Text style={styles.note}>
          मैं प्रमाणित करता हूँ (व्यापारी के लिये लागू) अनुज्ञापत्र में दर्ज कृषि उपज का भुगतान विक्रेता को किया जा
          चुका है तथा इस पर देय मंडी शुल्क / निराश्रित सहायता राशि का पूर्ण भुगतान किया जा चुका है |
        </Text>

        <View style={styles.signature}>
          <View style={styles.signatureItem}>
            <View style={styles.signatureLine} />
            <Text style={styles.label}>( {show(data.ownerName)} )</Text>
            <Text style={styles.label}>हस्ताक्षर</Text>
            <Text style={styles.label}>(कृषि उपज के स्वामी / प्रतिनिधि के)</Text>
          </View>
        </View>

        <Text style={styles.note}>
          उपरोक्त कृषि उपज की मंडी प्रांगण के बाहर ले जाने की अनुमति प्रदान की जाती है | प्रमाणित किया जाता है कि
          जहाँ तक ये व्यापारी के माल पर लागू होता है, मैंने भलीभांति जाँच कर अपने आपको आश्वस्त कर लिया है कि
          अनुज्ञापत्र में निकासी हेतु दर्शायी गई कृषि उपज का पूर्ण भुगतान विक्रेता को किया जा चुका है | तथा इस पर
          देय मंडी फीस एवं निराश्रित सहायता राशि का भुगतान प्राप्त किया जा चुका है |
        </Text>

        <View style={styles.formLocation}>
          <Text style={styles.label}>स्थान : {show(data.marketPlace)}</Text>
          <Text style={styles.label}>
            जारी करने का दिनांक एवं समय : {formatDate(data.issueDate)} {show(data.issueTime)}
          </Text>
        </View>
        <View style={styles.formLocation}>
          <Text style={styles.label}>
            प्रिंट दिनांक एवं समय : {formatDate(data.printDate)} {show(data.printTime)}
          </Text>
          <View>
            <Text style={styles.label}>सक्षम मंडी कर्मचारी</Text>
            <Text style={styles.label}>हस्ताक्षर / सील</Text>
          </View>
        </View>

        <Text style={styles.footer}>This is Computer Generated and No signature is required.</Text>
        <Text style={styles.footer}>NIC BHOPAL (MP) © 2025-2026</Text>
      </View>
    </Page>
  </Document>
);

export default AnugyaPatraDocument;
