/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import style from "./ViewsPayments.module.css";
const VITE_API_BASE = import.meta.env.VITE_API_BASE;
import { useSelector, useDispatch } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import PaymentsCard from "../PaymentsCard/PaymentsCard";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import Navbar from "../Navbar/Navbar";
import CommentBox from "../CommentsClient/CommentBox";
import ReviewButton from "../CommentsClient/ReviewButton";
import ButtonBack from "../Utils/ButtonBack/ButtonBack";
import Cover from "../Cover/Cover";
import { fetchUserLoginWithGoogle } from "../../redux/Slices/loginGoogleSlice";

function ViewsPayments() {
  const { user, isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
  const [isCommentBoxOpen, setIsCommentBoxOpen] = useState(false);
  const { pathname, search } = useLocation(); // ( pathname: url - search: Querys )
  const path = pathname.split("/")[2];
  const detail = useSelector((state) => state.detail);
  const usersLocal = useSelector((state) => state.usersLogin.user);
  const usersGoogle = useSelector((state) => state.googleLogin.user);
  const comments = useSelector((state) => state.comment.comments);
  const [paymentData, setPaymentData] = useState(null);
  const [userName, setUserName] = useState("");
  const [openCommentBoxId, setOpenCommentBoxId] = useState(null);
  const dispatch = useDispatch();

  // Nueva lógica para mapear los comentarios y verificar si el usuario ha dejado un comentario para cada profesional
  const professionalCommentsMap = comments.reduce((acc, comment) => {
    if (comment.Professional._id) {
      acc[comment.Professional._id] = true;
    }
    return acc;
  }, {});

  useEffect(() => {
    if (!usersLocal.userName) {
      // Verifica si Auth0 ha terminado de cargar
      if (!isLoading) {
        // Verifica si el usuario está autenticado
        if (isAuthenticated) {
          dispatch(fetchUserLoginWithGoogle({ email: user.email }));
        } else {
          loginWithRedirect();
        }
      }
    }
  }, [isLoading, isAuthenticated, user, loginWithRedirect]);

  const handleCommentBoxToggle = (professionalId) => {
    setOpenCommentBoxId((prevId) =>
      prevId === professionalId ? null : professionalId
    );
  };

  const handleClose = () => {
    setOpenCommentBoxId(null);
  };

  useEffect(() => {
    const userNameGoogle = usersGoogle && usersGoogle.userName;
    const userNameLocal = usersLocal && usersLocal.userName;
    if (userNameGoogle) {
      setUserName(userNameGoogle);
    }
    if (userNameLocal) {
      setUserName(userNameLocal);
    }
  }, []);

  useEffect(() => {
    if (search) {
      const dataMP = search.substring(1).split("&");
      let payment_id, idProf, status, payment_type;

      for (const pair of dataMP) {
        const [key, value] = pair.split("=");

        switch (key) {
          case "payment_id":
            payment_id = value;
            break;
          case "idProf":
            idProf = value;
            break;
          case "status":
            status = value;
            break;
          case "payment_type":
            payment_type = value;
            break;
        }
      }

      const valuesMP = {
        profIDID: idProf,
        paymentIDD: payment_id,
        status: status,
        paymentType: payment_type,
      };

      const fetchData = async () => {
        try {
          const checkPayment = await axios.get(
            VITE_API_BASE + `/payments/check/${valuesMP.paymentIDD}`
          );
          if (checkPayment.data.exists) {
            searchData();
          } else {
            await axios.post(VITE_API_BASE + "/payments/register", {
              professionalId: valuesMP.profIDID,
              paymentID: valuesMP.paymentIDD,
              userName: userName,
              isCompleted: valuesMP.status,
            });
            searchData();
          }
        } catch (error) {
          console.log("Error ViewPayments,", error);
        }
      };

      fetchData();
    } else {
      searchData();
    }
  }, [search, userName]);

  useEffect(() => {
    const createPreference = async () => {
      try {
        const response = await axios.post(
          VITE_API_BASE + "/create_preference",
          {
            description: detail.profession,
            price: detail.price,
            quantity: 1,
          }
        );
        console.log(response.data);
      } catch (error) {
        console.error("Error al crear la preferencia de pago:", error);
      }
    };

    createPreference();
  }, [userName]);

  const searchData = async () => {
    try {
      const resp = await axios.get(
        VITE_API_BASE + `/payments/search/${userName}`
      );
      // Ordenar los pagos del más reciente al más antiguo
      const sortedPayments = resp.data.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      setPaymentData(sortedPayments);
    } catch (error) {
      console.log("Error AxiosGet in ViewPayments,", error);
    }
  };

  return (
    <div className={style.contentAll}>
      <Navbar />
      <div className={style.contButtonBack}>
          <button className={style.buttonContratar}>
              <Link to="/home">Volver al inicio</Link>
          </button>
      </div>
      <h2 className={style.h2Titulo}>Historial de pagos</h2>

      <Cover />
      <div className={style.fondo}>
        <div className={style.contTitle}>
          <h4>
            {paymentData && paymentData[0] && paymentData[0].userName
              ? ` `
              : "Hasta la fecha no se registran pagos realizados."}
          </h4>
          {paymentData &&
            paymentData.map((data) => (
              <div key={data.paymentID}>
                <PaymentsCard data={data} />
                <ReviewButton
                  comments={comments}
                  handleCommentBoxToggle={handleCommentBoxToggle}
                  openCommentBoxId={openCommentBoxId}
                  professionalId={data.professionalId}
                  hasCommented={
                    professionalCommentsMap[data.professionalId] || false
                  }
                  handleClose={handleClose}
                />
              </div>
            ))}
          <div className={style.footer2}></div>
        </div>
      </div>
    </div>
  );
}

export default ViewsPayments;
