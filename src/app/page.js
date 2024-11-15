"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";

import axios from "axios";
import Link from "next/link";

const GatewayApiTest = () => {
  const [gatewayApiUrl, setGatewayApiUrl] = useState(
    process.env.NEXT_PUBLIC_API_GATEWAY_URL
  );
  const [gatewayApiRequest, setGatewayApiRequest] = useState();
  const [gatewayApiRequestNotes, setGatewayApiRequestNotes] = useState();
  const [gatewayApiResponseStatus, setGatewayApiResponseStatus] = useState("");
  const [gatewayApiResponseText, setGatewayApiResponseText] = useState("");

  const [inProgress, setInProgress] = useState(false);

  const [infoLabel, setInfoLabel] = useState("");
  const [actionCodes, setActionCodes] = useState([]);
  const [selectedActionCode, setSelectedActionCode] = useState("");

  const showInProgress = () => setInProgress(true);
  const hideInProgress = () => setInProgress(false);

  useEffect(() => {
    // Fetch action codes from JSON file when component mounts
    const fetchActionCodes = async () => {
      try {
        const response = await fetch("/data/requestPayload.json");
        if (!response.ok) {
          throw new Error("Failed to load action codes");
        }
        const data = await response.json();
        setActionCodes(data);
      } catch (error) {
        console.error("Error fetching action codes:", error);
      }
    };

    fetchActionCodes();
  }, []);

  const handleActionCodeChange = async (e) => {
    const selectedCode = e.target.value;
    setSelectedActionCode(selectedCode);

    // Find selected action code data
    const selectedAction = actionCodes.find(
      (action) => action.code === selectedCode
    );

    if (selectedAction) {
      setGatewayApiRequest(JSON.stringify(selectedAction.payload, null, 2));
      setGatewayApiRequestNotes(selectedAction.notes);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    showInProgress();

    try {
      let info = "";

      // Convert the JSON object to a string
      let stringifiedPayload;
      try {
        stringifiedPayload = JSON.stringify(
          JSON.stringify(JSON.parse(gatewayApiRequest))
        ); // Parse to ensure valid JSON, then stringify
      } catch (err) {
        setGatewayApiResponseStatus("Error");
        setGatewayApiResponseText(
          "Invalid JSON format in the request payload."
        );
        return;
      }

      const apiResponse = await callApiGateway(
        gatewayApiUrl,
        stringifiedPayload
      );
      setGatewayApiResponseStatus(apiResponse.status);
      setGatewayApiResponseText(apiResponse.text);

      if (apiResponse.status === "200 OK") {
        info += "API response received successfully.";
      }

      setInfoLabel(info);
    } catch (error) {
      setGatewayApiResponseStatus("Error");
      setGatewayApiResponseText(error.message);
    } finally {
      hideInProgress();
    }
  };

  const callApiGateway = async (url, requestPayload) => {
    try {
      const response = await axios.post(url, requestPayload, {
        headers: {
          "Content-Type": "application/json",
        },
        responseType: "text", // Force axios to treat the response as text
      });

      return {
        status: `${response.status} ${response.statusText}`,
        text: response.data,
      };
    } catch (error) {
      console.error(
        "Error details:",
        error.response ? error.response.data : error.message
      );
      return {
        status: "API Gateway Error",
        text: `${error.response ? error.response.data : error.message}`,
      };
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>API Client</h1>
      <h3 className={styles.small_heading}>Elite's Independent Drivers</h3>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.infolabel}>{infoLabel}</label>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="txtGatewayAPIURL" className={styles.label}>
            API URL
          </label>
          <input
            type="text"
            id="txtGatewayAPIURL"
            name="txtGatewayAPIURL"
            value={gatewayApiUrl}
            onChange={(e) => setGatewayApiUrl(e.target.value)}
            className={`${styles.input} ${styles.longInput}`}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="actionCode" className={styles.label}>
            API Request Action Code
          </label>
          <select
            id="actionCode"
            name="actionCode"
            value={selectedActionCode}
            onChange={handleActionCodeChange}
            className={`${styles.input} ${styles.longInput}`}
          >
            <option value="">Select Action Code</option>
            {actionCodes.map((action) => (
              <option key={action.code} value={action.code}>
                {action.code}
                {" ( "}
                {action.desc}
                {" )"}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="txtGatewayAPIRequest" className={styles.label}>
            API Request Payload
          </label>
          <textarea
            id="txtGatewayAPIRequest"
            name="txtGatewayAPIRequest"
            value={gatewayApiRequest}
            onChange={(e) => setGatewayApiRequest(e.target.value)}
            className={styles.textArea}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="txtGatewayAPIRequest" className={styles.label}>
            API Call Notes
          </label>
          <textarea
            id="txtGatewayAPIRequestNotes"
            name="txtGatewayAPIRequestNotes"
            value={gatewayApiRequestNotes}
            onChange={(e) => setGatewayApiRequestNotes(e.target.value)}
            className={styles.textAreaSmall}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="txtGatewayAPIResponseStatus" className={styles.label}>
            API Response Status
          </label>
          <input
            type="text"
            id="txtGatewayAPIResponseStatus"
            name="txtGatewayAPIResponseStatus"
            value={gatewayApiResponseStatus}
            readOnly
            className={`${styles.input} ${styles.readOnlyInput}`}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="txtGatewayAPIResponseText" className={styles.label}>
            API Response
          </label>
          <textarea
            id="txtGatewayAPIResponseText"
            name="txtGatewayAPIResponseText"
            value={gatewayApiResponseText}
            readOnly
            className={styles.textArea}
          />
        </div>
        <div className={styles.formGroup}>
          <button
            type="submit"
            name="btnSubmit"
            className={styles.submitButton}
          >
            {inProgress ? "Making Request..." : "Make API Request"}
          </button>
        </div>
        <div className={styles.lblLink}>
          <Link href="mailto:kazimbukhari@gmail.com">Report Issues</Link>
        </div>
      </form>
    </div>
  );
};

export default GatewayApiTest;
