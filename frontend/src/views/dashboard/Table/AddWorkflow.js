import { Box, IconButton, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { FaPlus } from "react-icons/fa6";
import { GrCheckmark, GrClose } from 'react-icons/gr';
import { addWorkflow } from '../../../JS/actions/workflows';
import { useDispatch } from 'react-redux';

const AddWorkflow = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [recentWorkflow, setRecentWorkflow] = useState(null); // Only store the newly added workflow
    const dispatch = useDispatch();

    const handleBoxClick = () => {
        setIsEditing(true);
    };

    const handleSave = async () => {
        setIsEditing(false);
        const newWorkflowData = {
            workflowTitle: inputValue,
            workflowColor: "#CC9A82",
            workflowBackground: "#FFDDC1",
        };

        try {
            const newWorkflow = await dispatch(addWorkflow(newWorkflowData)); 
            setRecentWorkflow(newWorkflow.workflowTitle); 
        } catch (error) {
            console.error('Error adding workflow:', error);
        }

        setInputValue('');
    };

    const handleCancel = () => {
        setIsEditing(false);
        setInputValue('');
    };

    return (
        <Box>
            {!isEditing ? (
                <Box
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '45px',
                        height: '45px',
                        borderRadius: '8px',
                        background: 'white',
                        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                        cursor: 'pointer',
                    }}
                    onClick={handleBoxClick}
                >
                    <Typography
                        sx={{
                            fontSize: '20px',
                            color: '#4a5568',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <FaPlus />
                    </Typography>
                </Box>
            ) : (
              <>
                <Box
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '200px',
                        padding: '10px',
                        borderRadius: '8px',
                        marginLeft: '20px',
                        background: 'white',
                        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                    }}
                >
                    <TextField
                        variant="outlined"
                        size="small"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Enter workflow title"
                        style={{ width: '100%' }}
                    /> 
                                   </Box>

                    <Box
                        style={{
                            display: 'flex',
                            gap: '8px',
                            marginTop: '10px',
                            marginLeft:"25px"
                        }}
                    >
                        <IconButton
                            onClick={handleSave}
                            style={{
                                width: '28px',
                                height: '28px',
                                backgroundColor: "white",
                                opacity: 0.9,
                                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
                                borderRadius: "4px",
                                padding: "0px",
                                boxSizing: "border-box",
                            }}
                        >
                            <GrCheckmark style={{ color: "black", fontSize: '12px' }} />
                        </IconButton>
                        <IconButton
                            onClick={handleCancel}
                            style={{
                                width: '28px',
                                height: '28px',
                                backgroundColor: "white",
                                opacity: 0.9,
                                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
                                borderRadius: "4px",
                                padding: "4px",
                                boxSizing: "border-box",
                            }}
                        >
                            <GrClose style={{ color: "black", fontSize: '12px' }} />
                        </IconButton>
                    </Box>
                    </>  )}

                    {recentWorkflow && (
    <Box
        style={{
            display: 'flex',
            alignItems: 'center',
            marginTop: '10px',
            gap: '10px',
            marginLeft: '20px',
            position: 'relative',
        }}
    >
        <Box
            style={{
                padding: '5px 10px',
                borderRadius: '8px',
                background: '#FFDDC1',
                color: '#4a5568',
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
            }}
        >
            {recentWorkflow}
        </Box>

       
    </Box>
)}



        </Box>
    );
};

export default AddWorkflow;
