import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { saveAs } from 'file-saver';

interface Bill {
  id: number;
  customer_rftag: string;
  total_amount: string | number; // Adjusted to handle both types
  payment_status: string;
  created_at: string;
  customer_name: string;
}

const BillList: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);

  useEffect(() => {
    axios.get('http://localhost:3000/bills')
      .then(response => {
        console.log(response.data); // Debugging the data structure
        setBills(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the bills!', error);
      });
  }, []);

  const handleExportToExcel = () => {
    axios.get('http://localhost:3000/export-bills', { responseType: 'blob' })
      .then(response => {
        saveAs(response.data, 'BillList.xlsx');
      })
      .catch(error => {
        console.error('There was an error exporting the bills!', error);
      });
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Bill List</h1>

      <table className="table table-striped">
        <thead>
          <tr>
            <th>#</th>
            <th>Customer RFID Tag</th>
            <th>Total Amount</th>
            <th>Payment Status</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {bills.map((bill, index) => (
            <tr key={bill.id}>
              <td>{index + 1}</td>
              <td>{bill.customer_rftag}</td>
              <td>{bill.total_amount ? parseFloat(bill.total_amount as string).toFixed(2) : "0.00" }</td>
              <td>{bill.payment_status}</td>
              <td>{new Date(bill.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="btn btn-success mt-3" onClick={handleExportToExcel}>
        Export to Excel
      </button>
    </div>
  );
};

export default BillList;
