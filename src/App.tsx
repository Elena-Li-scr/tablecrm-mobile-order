import "./App.css";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { authorization, getOrganizations, getClientsByPhone, getWarehouses, getPriceTypes, getPayboxes, getProducts, createSale } from "@/server/api";

type Product = {
  id: number;
  name: string;
  prices: null | unknown;
  unit: null | number;
};

type Good = {
  nomenclature: number;
  nomenclature_name: string;
  quantity: number;
  price: number;
  price_type: number;
};


function App() {
  const [token, setToken] = useState(() => sessionStorage.getItem("token") || "");
  const [isAuth, setIsAuth] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [client, setClient] = useState('');
  const [contragent, setContragent] = useState('');
  const [warehouses, setWarehouses] = useState([]);
  const [warehouse, setWarehouse] = useState("");
  const [organizations, setOrganizations] = useState([]);
  const [organizationId, setOrganizationId] = useState("");
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [paymentTypeId, setPaymentTypeId] = useState("");
  const [payboxId, setPayboxId] = useState("");
  const [payboxes, setPayboxes] = useState([]);
  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [goods, setGoods] = useState<Good[]>([]);

  //Очистка локального хранилища при загрузке приложения

  useEffect(() => {
    sessionStorage.removeItem("token");
  }, []);

  //Загрузка всех данных при авторизации

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
        try {
          const warehousesResponse = await getWarehouses(token);
          const organizationsResponse = await getOrganizations(token);
          const priceTypesResponse = await getPriceTypes(token);
          const payboxesResponse = await getPayboxes(token);
          const productsResponse = await getProducts(token);

          if (warehousesResponse.status === 200) {
            setWarehouses(warehousesResponse.data.result);
            console.log(warehousesResponse.data.result);
          }

          if (organizationsResponse.status === 200) {
            setOrganizations(organizationsResponse.data.result);
            console.log(organizationsResponse.data.result);
          }
          if (priceTypesResponse.status === 200) {
            setPaymentTypes(priceTypesResponse.data.result);
            console.log(priceTypesResponse.data.result);
          }
          if (payboxesResponse.status === 200) {
            setPayboxes(payboxesResponse.data.result);
            console.log(payboxesResponse.data.result);
          }

          if (productsResponse.status === 200) {
            setProducts(productsResponse.data.result);
            console.log(productsResponse.data.result);
          }

        } catch (error) {
          console.log("Ошибка получения данных", error);
        }

      }
    } catch (error) {
      console.log("Ошибка авторизации", error);
    }
  };

  //Поиск клиента по номеру телефона

  const findClient = async () => {
    try {

      if (!token) {
        alert("Токен не найден");
        return;
      }

      const searchPhone = phoneNumber.trim();

      const response = await getClientsByPhone(token, searchPhone);

      if (response.status === 200) {
        const foundClient = response.data.result[0]
        setClient(foundClient?.name || "");
        setContragent(foundClient?.id || "");
        console.log(foundClient);
      }
    } catch (error) {
      console.log("Ошибка поиска клиента", error);
    }
  };

  //Добавление товара в корзину

  const addGood = (product: Product) => {
    const good: Good = {
      nomenclature: product.id,
      nomenclature_name: product.name,
      quantity: 1,
      price: 0,
      price_type: Number(paymentTypeId),
    };

    setGoods((prev) => [...prev, good]);
  };

  //Добавление товара из поиска

  const updateGood = (
    index: number,
    field: "quantity" | "price",
    value: number
  ) => {
    setGoods((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
            ...item,
            [field]: value,
          }
          : item
      )
    );
  };

  const removeGood = (index: number) => {
    setGoods((prev) => prev.filter((_, i) => i !== index));
  };

  const total = goods.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);

  //итоговый запрос

  const submitSale = async (conduct: boolean) => {
    try {
      const token = sessionStorage.getItem("token");

      if (!token) {
        alert("Токен не найден");
        return;
      }

      const payload = [{
        organization: Number(organizationId),
        operation: "Заказ",
        contragent: Number(contragent),
        warehouse: Number(warehouse),
        paybox: Number(payboxId),
        goods,
      }];

      const response = await createSale(
        token,
        conduct,
        payload
      );

      if (response.status === 200) {
        if (conduct) {
          alert("Продажа успешно создана и проведена");
        } else {
          alert("Продажа успешно создана");
        }
      }

      console.log(response.data);
    } catch (error) {
      console.log("Ошибка создания продажи", error);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(productSearch.toLowerCase())
  );


  return (

    <div className="w-full p-4 min-h-screen bg-muted flex flex-col items-center justify-start space-y-4">

      {/* Авторизация */}

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3">
          <CardTitle className="text-lg text-gray-500">TABLECRM.COM</CardTitle>
          <CardDescription className="text-2xl text-black-600 font-bold">Мобильный заказ</CardDescription>
          <p className="text-sm text-gray-500">WebApp для создания продажи и проведения в один клик.</p>
          <div className="flex justify-start">
            {isAuth ? (
              <p className="text-orange-500 text-sm ">Касса авторизована</p>
            ) : (
              <p className="text-blue-500 text-sm ">Касса не авторизована</p>
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
            className="w-full bg-orange-600 hover:bg-orange-700"
            onClick={checkAuth}
            disabled={!token.trim()}
          >
            Авторизоваться
          </Button>
        </CardContent>

      </Card>

      {/* Поиск клиента */}

      <Card className="w-full max-w-md">
        <CardHeader className="text-base text-black-500">
          Введите номер телефона клиента для поиска
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="+79990000000"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          <Button
            className="w-full bg-orange-600 hover:bg-orange-700"
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

      {/* Параметры продажи */}

      <Card className="w-full max-w-md">
        <CardHeader className="text-base text-black-500">
          Параметры продажи
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Склад */}

          <Select value={warehouse} onValueChange={setWarehouse}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите склад" />
            </SelectTrigger>
            <SelectContent>
              {warehouses.map((warehouse) => (
                <SelectItem key={warehouse.id} value={String(warehouse.id)}>
                  {warehouse.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Организация */}

          <Select value={organizationId} onValueChange={setOrganizationId}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите организацию" />
            </SelectTrigger>
            <SelectContent>
              {organizations.map((organization) => (
                <SelectItem key={organization.id} value={String(organization.id)}>
                  {organization.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Тип оплаты */}

          <Select value={paymentTypeId} onValueChange={setPaymentTypeId}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите тип оплаты" />
            </SelectTrigger>
            <SelectContent>
              {paymentTypes.map((paymentType) => (
                <SelectItem key={paymentType.id} value={String(paymentType.id)}>
                  {paymentType.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Счет */}

          <Select value={payboxId} onValueChange={setPayboxId}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите счет" />
            </SelectTrigger>
            <SelectContent>
              {payboxes.map((paybox) => (
                <SelectItem key={paybox.id} value={String(paybox.id)}>
                  {paybox.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Выбор товара */}

      <Card className="w-full max-w-md">
        <CardHeader className="text-base text-black-500">
          Поиск и добавление Товаров
        </CardHeader>

        <CardContent className="space-y-3">
          <Input
            placeholder="Поиск товара по названию"
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
          />

          <div className="max-h-44 overflow-y-auto rounded-md border bg-white">
            {products.length > 0 ? (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between gap-3 border-b px-3 py-3 last:border-b-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {product.name}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {product.prices
                        ? `${product.prices} ₽`
                        : "Цена не указана"}
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="shrink-0 text-xs"
                    onClick={() => addGood(product)}
                  >
                    Добавить
                  </Button>
                </div>
              ))
            ) : (
              <p className="px-3 py-4 text-sm text-muted-foreground">
                Товары не найдены
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Корзина */}

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-base flex items-center gap-2">
            Корзина
          </CardTitle>
          <CardDescription>
            Количество, цена и сумма по позициям
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          {goods.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Добавьте хотя бы один товар
            </p>
          ) : (
            goods.map((item, index) => (
              <div
                key={item.nomenclature}
                className="rounded-md border bg-white p-3 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium">
                    {item.nomenclature_name}
                  </p>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={() => removeGood(index)}
                  >
                    🗑
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t pt-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Количество</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateGood(index, "quantity", Number(e.target.value))
                      }
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Цена</Label>
                    <Input
                      type="number"
                      min="0"
                      value={item.price}
                      onChange={(e) =>
                        updateGood(index, "price", Number(e.target.value))
                      }
                    />
                  </div>
                </div>

                <p className="text-right text-sm font-medium">
                  Сумма: {(item.quantity * item.price).toFixed(2)} ₽
                </p>
              </div>
            ))
          )}

        </CardContent>
      </Card>

      {/* Футер */}
      <Card className="w-full max-w-md">
        <CardContent className="space-y-2">
          <div className="w-full max-w-md rounded-md border bg-white px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Итого</span>
            <span className="text-base font-semibold">
              {total.toFixed(2)} ₽
            </span>
          </div>
          <Button
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            size="lg"
            onClick={() => submitSale(false)}
            disabled={goods.length === 0}
          >
            Создать продажу
          </Button>

          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={() => submitSale(true)}
            disabled={goods.length === 0}
          >
            Создать и провести
          </Button>

        </CardContent>
      </Card>


    </div >


  )
}

export default App
