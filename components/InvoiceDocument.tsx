
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30 },
  section: { marginBottom: 10 },
  header: { fontSize: 24, marginBottom: 20, color: '#0bb489' },
  subheader: { fontSize: 18, marginBottom: 10, color: '#0bb489' },
  text: { fontSize: 12, marginBottom: 5 },
  footer: { marginTop: 20, fontSize: 12, color: 'gray' },
});

const InvoiceDocument = ({ issuedDate, payerIdentity, firstName, lastName, email, address, city, postalCode, country, lendingToken, lendingAmount, description, tokenOptions }) => (
  <Document>
    <Page style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.header}>Invoice</Text>
        <Text style={styles.text}>Issued Date: {issuedDate}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.subheader}>From:</Text>
        <Text style={styles.text}>{payerIdentity}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.subheader}>Lender Details:</Text>
        <Text style={styles.text}>{firstName} {lastName}</Text>
        <Text style={styles.text}>{email}</Text>
        <Text style={styles.text}>{address}</Text>
        <Text style={styles.text}>{city} {postalCode} {country}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.subheader}>Payment Details:</Text>
        <Text style={styles.text}>Token: {tokenOptions[lendingToken]} - {lendingToken}</Text>
        <Text style={styles.text}>Amount: {lendingAmount}</Text>
        <Text style={styles.text}>Description: {description}</Text>
      </View>
      <View style={styles.footer}>
        <Text>Thank you for using BankOnRequest!</Text>
        <Text>Contact us at mkaran4249@gmail.com</Text>
      </View>
    </Page>
  </Document>
);

export default InvoiceDocument;