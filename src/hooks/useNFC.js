import { useState, useRef, useEffect } from 'react';

export const useNFC = () => {
    const [isReading, setIsReading] = useState(false);
    const [error, setError] = useState(null);
    const abortController = useRef(null);

    const scan = async (onReading) => {
        if (!('NDEFReader' in window)) {
            setError("Web NFC is not supported on this device/browser.");
            return;
        }

        abortController.current = new AbortController();
        setError(null);
        setIsReading(true);

        try {
            const ndef = new NDEFReader();
            await ndef.scan({ signal: abortController.current.signal });

            ndef.onreading = event => {
                const decoder = new TextDecoder();
                // Initialize with serialNumber (UID) - clean unique ID
                let data = { serialNumber: event.serialNumber };

                for (const record of event.message.records) {
                    // Try to handle both text and json records
                    if (record.recordType === "text") {
                        const text = decoder.decode(record.data);
                        try {
                            const json = JSON.parse(text);
                            data = { ...data, ...json };
                        } catch (e) {
                            data.text = text;
                        }
                    } else if (record.recordType === "json") {
                        const json = JSON.parse(decoder.decode(record.data));
                        data = { ...data, ...json };
                    }
                }
                onReading(data);
            };

            ndef.onreadingerror = () => {
                setError("Cannot read data from the NFC tag. Try another one?");
            };

        } catch (err) {
            setIsReading(false);
            setError(`Error: ${err.message}`);
        }
    };

    const stop = () => {
        if (abortController.current) {
            abortController.current.abort();
            abortController.current = null;
        }
        setIsReading(false);
    };

    useEffect(() => {
        return () => stop();
    }, []);

    return { scan, stop, isReading, error };
};
