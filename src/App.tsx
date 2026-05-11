import "./App.css";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import { authorization, getClients } from "@/server/api";

function App() {
  const [token, setToken] = useState(() => sessionStorage.getItem("token") || "");
  const [isAuth, setIsAuth] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [savedPhone, setSavedPhone] = useState("");
  const [clients, setClients] = useState([]);
  const [client, setClient] = useState('');
  // const [warehouses, setWarehouses] = useState([]);
  // const [payboxes, setPayboxes] = useState([]);
  // const [organizations, setOrganizations] = useState([]);
  // const [priceTypes, setPriceTypes] = useState([]);
  // const [products, setProducts] = useState([]);
  // const [selectedProducts, setSelectedProducts] = useState<OrderProduct[]>([]);

  useEffect(() => {
    if (sessionStorage.getItem("token")) {
      setIsAuth(true);
      setToken(sessionStorage.getItem("token")!);
    }
  }, [])


  const checkAuth = async () => {
    try {
      if (!token) {
        alert("Токен не найден");
        return;
      }

      const response = await authorization(token);

      if (response.status === 200) {
        console.log("Авторизация успешна");

        sessionStorage.setItem("token", token);
        setIsAuth(true);
      }
    } catch (error) {
      console.log("Ошибка авторизации", error);
    }
  };

  const findClient = async () => {
    try {

      if (!token) {
        alert("Токен не найден");
        return;
      }

      const searchPhone = phoneNumber.trim();

      const response = await getClients(token);

      if (response.status === 200) {
        const foundClient = response.data.result.find(
          (item) => item.phone === searchPhone
        );

        setClient(foundClient?.name || "");
        console.log(foundClient?.name);
      }
    } catch (error) {
      console.log("Ошибка поиска клиента", error);
    }
  };


  return (

    <div className="w-full p-4 min-h-screen bg-muted flex flex-col items-center justify-start space-y-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3">
          <CardTitle className="text-lg text-gray-500">TABLECRM.COM</CardTitle>
          <CardDescription className="text-2xl text-black-600 font-bold">Мобильный заказ</CardDescription>
          <p className="text-sm text-gray-500">WebApp для создания продажи и проведения в один клик.</p>
          <div className="flex justify-start">
            {isAuth ? (
              <p className="text-blue-500 text-sm ">Касса авторизована</p>
            ) : (
              <p className="text-red-500 text-sm ">Касса не авторизована</p>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">

          <Input
            placeholder="Введите токен кассы"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />

          <Button
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={checkAuth}
            disabled={!token.trim()}
          >
            Авторизоваться
          </Button>
        </CardContent>

      </Card>
      <Card className="w-full max-w-md">
        <CardHeader className="text-base text-gray-500">
          Введите номер телефона клиента для поиска
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="+79990000000"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={findClient}
            disabled={!phoneNumber}
          >
            Найти
          </Button>
          <p className="text-base">Найденный клиент:</p>
          {client ? (
            <p className="text-base">{client}</p>
          ) : (
            <p className="text-base">Клиент не найден</p>
          )}
        </CardContent>
      </Card>


    </div >


  )
}

export default App
