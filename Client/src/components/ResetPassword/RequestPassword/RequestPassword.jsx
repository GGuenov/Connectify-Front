/* eslint-disable react/prop-types */
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Notification from '../Notification/Notification';
import { fetchRequest } from '../../../redux/Slices/RequestPasswordSlice';
import { selectUserType } from '../../../redux/Slices/userTypeSlice';
import './RequestPassword.css';
import { Link } from 'react-router-dom';

export default function RequestPassword() {
  const [email, setEmail] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [disableForm, setDisableForm] = useState(false);
  const dispatch = useDispatch();
  const userType = useSelector(selectUserType);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setDisableForm(true);
    try {
      const response = await dispatch(fetchRequest(email, userType));
      if (response === undefined) {
        window.alert('Email invalido o no existe');
        setDisableForm(false);
        return;
      }
      const message = response.data.message;
      setNotificationMessage(message);
      setShowNotification(true);
    } catch (error) {
      console.error('Error en la solicitud:', error);
      window.alert(error);
      setDisableForm(false);
    }
  };

  return (
    <div>
      <link
        rel="stylesheet"
        href="https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css"
      />
      <link
        href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css"
        rel="stylesheet"
      />
      <button className="buttonContratar">
        <Link to="/home" className="LinkTo">
          Volver al inicio
        </Link>
      </button>
      <div className="form-gap"></div>
      <div className="container">
        <div className="row">
          <div className="col-md-4 col-md-offset-4">
            <div className="panel panel-default">
              <div className="panel-body">
                <div className="text-center">
                  <h3>
                    <i className="fa fa-lock fa-4x"></i>
                  </h3>
                  <h2 className="text-center">¿Has olvidado tu contraseña?</h2>
                  <p>Puede restablecer su contraseña aquí.</p>
                  <div className="panel-body">
                    <form
                      id="register-form"
                      role="form"
                      autoComplete="off"
                      className="formRequest"
                      method="post"
                      disabled={disableForm}
                    >
                      <div className="form-group">
                        <div className="input-group">
                          <span className="input-group-addon">
                            <i className="glyphicon glyphicon-envelope color-blue"></i>
                          </span>
                          <input
                            id="email"
                            name="email"
                            placeholder="Dirección de correo"
                            className="form-control"
                            type="email"
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <button
                          className="btn btn-lg btn-primary btn-block"
                          onClick={handlePasswordReset}
                        >
                          Restablecer contraseña
                        </button>
                      </div>
                      <input
                        type="hidden"
                        className="hide"
                        name="token"
                        id="token"
                        value=""
                      />
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showNotification && <Notification message={notificationMessage} />}
    </div>
  );
}
