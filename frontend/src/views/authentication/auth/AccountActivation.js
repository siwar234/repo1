import { Box, Typography, Button, IconButton, InputAdornment } from '@mui/material';
import { FcOk } from 'react-icons/fc';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { activateEmail, cleanLoginError, signupAfterInvitation } from '../../../JS/actions/user';
import { useSelector } from 'react-redux';
import CustomTextField from '../../../components/forms/theme-elements/CustomTextField';
import { Stack } from '@mui/system';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useLocation } from 'react-router-dom';
import { url } from "../../../ConnectionString";

const AccountActivation = ({ title, subtitle, subtext }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    email,
    password: '',
    confirmPassword: '',
  });
  const [passwordShown, setPasswordShown] = useState(false);
  const [confirmPasswordShown, setConfirmPasswordShown] = useState(false);
  const [errors, setErrors] = useState({}); 
  
  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get('token');
  const equipeId = searchParams.get('equipeId');
  const emailAlreadyExists = useSelector(state => state.userReducer.emailAlreadyExists);
  const backendErrors = useSelector(state => state.userReducer?.errors);

  const isInvitationUrl = () => {
    const params = new URLSearchParams(location.search);
    return params.has('equipeId') && params.has('token');
  };

  useEffect(() => {
    axios
      .post(`${url}/auth/get-email-from-token/${token}`)
      .then((response) => {
        setEmail(response.data.email);
      })
      .catch((error) => {
        console.error('Error fetching email:', error);
      });
  }, [token]);

  useEffect(() => {
    if (backendErrors?.Errors) {
      Swal.fire({
        icon: 'warning',
        text: backendErrors?.Errors[0]?.msg,
        timer: 1000,
        showCloseButton: true,
        showConfirmButton: true,
        confirmButtonColor: 'orange',
      });
      dispatch(cleanLoginError());
    }
  }, [backendErrors?.Errors, dispatch]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value,
    });

    const newErrors = { ...errors };

    if (id === 'password') {
      if (!value) {
        newErrors.password = 'Password is required';
      } else if (value.length < 8) {
        newErrors.password = 'Password must be at least 8 characters long';
      } else {
        delete newErrors.password; 
      }
    }

    if (id === 'confirmPassword') {
      if (value !== formData.password) {
        newErrors.confirmPassword = 'Passwords do not match';
      } else {
        delete newErrors.confirmPassword; 
      }
    }

    setErrors(newErrors);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      if (isInvitationUrl()) {
        await dispatch(signupAfterInvitation(token, equipeId, formData.firstName, formData.password, email, navigate));
      } else {
        await dispatch(activateEmail(token, formData.firstName, formData.password, email, navigate));
      }
    } catch (error) {
      console.error('Activation failed:', error);
    }
  };

  const togglePassword = () => {
    setPasswordShown(!passwordShown);
  };

  const toggleConfirmPassword = () => {
    setConfirmPasswordShown(!confirmPasswordShown);
  };

  return (
    <>
      {title && (
        <Typography fontWeight="700" variant="h2" mb={1}>
          {title}
        </Typography>
      )}

      {subtext}

      <Box>
        <Stack mb={3} sx={{ alignItems: 'center' }}>
          <Typography color="#172B4D" variant="h5" fontWeight={600}>
            Email address verified
            <FcOk style={{ marginLeft: '8px' }} />
          </Typography>
          <Typography color="#172B4D" variant="h7" fontWeight={500} style={{ marginRight: '0px' }}>
            Finish setting up your account
          </Typography>
        </Stack>

        {emailAlreadyExists && (
          <Stack mb={3} sx={{ alignItems: 'center' }}>
            <Typography variant="h9" color="rgb(90 98 113)" fontWeight={410} textAlign="center" fontSize="13px" lineHeight="17px">
              It seems that an account is already associated with this e-mail. Please login or reset your password if you've forgotten it.
            </Typography>
          </Stack>
        )}

        <Stack mb={3}>
          <Typography variant="subtitle1" fontWeight={600} component="label" htmlFor="email" mb="5px" color="#495975">
            Email address
          </Typography>
          <Typography variant="h6" fontWeight={700} component="label" htmlFor="firstName" mb="-1px">
            {email}
          </Typography>
        </Stack>

        <Typography variant="subtitle1" fontWeight={600} component="label" htmlFor="firstName" mb="7px" color="#495975">
          Full Name
        </Typography>
        <Stack mt={1} sx={{ alignItems: 'center' }}>
          <CustomTextField
            id="firstName"
            variant="outlined"
            fullWidth
            placeholder="Enter full name"
            onChange={handleChange}
          />
        </Stack>

        <Stack mt={1}>
          <Typography variant="subtitle1" fontWeight={600} component="label" htmlFor="password" mb="7px" color="#495975">
            Password
          </Typography>
          <CustomTextField
            id="password"
            variant="outlined"
            fullWidth
            onChange={handleChange}
            type={passwordShown ? 'text' : 'password'}
            placeholder="Create password"
            error={Boolean(errors.password)}
            helperText={errors.password}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton aria-label="toggle password visibility" onClick={togglePassword}>
                    {passwordShown ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Stack>

        <Stack mb={3}>
          <Typography variant="subtitle1" fontWeight={600} component="label" htmlFor="confirmPassword" mb="7px" color="#495975">
            Confirm Password
          </Typography>
          <Stack mt={1}>
            <CustomTextField
              id="confirmPassword"
              variant="outlined"
              fullWidth
              onChange={handleChange}
              type={confirmPasswordShown ? 'text' : 'password'}
              placeholder="Confirm password"
              error={Boolean(errors.confirmPassword)}
              helperText={errors.confirmPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton aria-label="toggle confirm password visibility" onClick={toggleConfirmPassword}>
                      {confirmPasswordShown ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
        </Stack>

        <Stack mt={2}>
          <Button type="submit" color="primary" variant="contained" size="large" fullWidth onClick={handleSubmit}>
            Continue
          </Button>
        </Stack>
      </Box>
      {subtitle}
    </>
  );
};

export default AccountActivation;
