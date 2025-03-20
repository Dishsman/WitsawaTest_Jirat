import { useEffect, useState } from 'react'
import './App.css'
import { Select, Table, Input, Button, Popconfirm, Form, Modal, AutoComplete } from 'antd';
// import type { TableProps } from 'antd';
import axios from 'axios';
import allCountries from './Country';
interface Icar {
  make_id: string,
  make_display: string,
  make_is_common: number,
  make_country: string,
}
function App() {
  const [data, setData] = useState<Icar[]>([]);
  const [searchName, setSearchName] = useState<string>("") //เอาไว้เก็บ ข้อความที่่ userพิมพ์ตอน search
  const [selectedCountry, setSelectedCountry] = useState<string | undefined>(undefined); //เก็บของ country
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCar, setEditingCar] = useState<Icar | null>(null);
  const [form] = Form.useForm(); //เอาไว้ใช้ทำ function ของModal set & reset field
  const fetchData = async () => {
    try {
      const response = await axios.get('https://gist.githubusercontent.com/ak1103dev/e4a31efd9f5dcac80e086f0ab9a88ffb/raw/e77545dbef9b06bd138b085b5421eaca77cfe18f/cars.json');
      // console.log('Data:', response.data); //.dataเพราะmake_ ต่างๆอยู่ในdata
      setData(response.data.Makes)//ใส่ข้อมูลเข้า ตัวแปรData จะได้เอาไปใช้ต่อในตารางได้ //ถ้าไม่ใส่ makes จะหาmake_ไม่เจอ
    } catch (error) {
      console.error('Error:', error);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  // console.log('ข้อมูลใน state:', data);
  // console.log(searchName)
  // ฟิลเตอร์ข้อมูลตาม searchName และ selectedCountry
  const handleAdd = () => {
    setEditingCar(null); // reset Editing car
    setIsModalVisible(true);
  };

  const handleEdit = (car: Icar) => {
    setEditingCar(car);
    setIsModalVisible(true);
  };
  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const handleDelete = (make_id: string) => {
    setData(data.filter((car) => car.make_id !== make_id));
  };
  const handleModalOk = (values: Icar) => {
    if (editingCar) {
      // Editing
      setData(
        data.map((car) => (car.make_id === editingCar.make_id ? { ...editingCar, ...values } : car)) //จับว่าตรงไหมถ้าตรงก็lockหัวไว้ ถ้าไม่ตรงก็ปล่อยคืน เป็นcarปกติ //... coppy propertyต่างๆ กับValue เดิมของมัน
      );
    } else {
      // Adding
      const newCar = { ...values };
      setData([...data, newCar]);
    }
    setIsModalVisible(false);
  };
  useEffect(() => {
    if (isModalVisible) {
      if (!editingCar) {
        form.resetFields(); // Reset form fields in Modal ทำให้ตอน Add modal ว่าง
      } else {
        // Set form values to the car data ทำให้ ใน Modal มีข้อมูลขึ้นตอน Edit
        form.setFieldsValue({
          make_display: editingCar.make_display,
          make_country: editingCar.make_country,
        });
      }
    }
  }, [isModalVisible, editingCar, form]);


  const filteredData = data.filter(item =>
    item.make_display.toLowerCase().includes(searchName.toLowerCase()) &&  // ค้นหาข้อมูลที่ตรงกับชื่อที่พิมพ์
    (selectedCountry ? item.make_country === selectedCountry : true) // ถ้ามีการเลือกประเทศให้กรองตามประเทศนั้น
  );
  const columns = [
    {
      title: 'Name',
      dataIndex: 'make_display',
      key: 'make_display',
      width: '40%'
    },
    {
      title: 'Country',
      dataIndex: 'make_country',
      key: 'make_country',
      width: '30%'
    },
    {
      title: '',
      key: 'action',
      width: '30%',
      render: (record: Icar) => ( //record คือข้อมูลของแถวนั้นๆ
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <Button onClick={() => handleEdit(record)} style={{
            marginRight: "4%", borderColor: '#ffffff00',
            background: '#ffffff00',
          }}>
            <img src="edit.svg"
              style={{ width: '70%', height: '100%' }}
            />
          </Button>
          <Popconfirm
            title="Are you sure to delete this car?"
            onConfirm={() => handleDelete(record.make_id)}
            okText="Yes"
            cancelText="No"
          >
            <Button style={{ borderColor: '#ffffff00', background: '#ffffff00',}}>
            <img src="bin.svg"
              style={{ width: '70%', height: '100%' }}
            />
              </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];
  return (
    <div id='bg' style={{ height: '100vh', width: '100vw', backgroundColor: '#cfe2f3' }}>
      <div id='big' style={{ height: '100%', width: '100%', boxSizing: 'border-box', padding: '3%' }}>
        {/* borderbox รวมpadding,border เข้าไปในความสูง/กว้างของ width height ทำให้ไม่overflow  */}
        <div id='optionZone' style={{
          height: '30%', width: '100%', display: 'flex', flexDirection: 'column',
          alignItems: 'center'
        }}>
          <div id='headline' style={{ height: '50%', width: '70%', fontSize: '2rem', paddingLeft:'3%' }}>
            Cars
          </div>
          <div id='search' style={{ height: '50%', width: '70%', display: 'flex', flexDirection: 'row' }}>
            <div id='optionLeft' style={{ width: '90%', display: 'flex', gap: '20%' }}>
              <Select
                // defaultValue=''
                style={{ width: '30%', height: '35%' }} //20 25
                allowClear
                placeholder="Select Country"
                value={selectedCountry} //ถ้าไม่ใส่ ต่อให้ขึ้นในoptionก็ filter อะไรไม่ได้เพราะไม่มีvalue
                onChange={setSelectedCountry} //เปลี่ยน value ตามที่เลือกเฉยๆ
                options={[
                  ...Array.from( //สร้าง array จาก(new set ด้านล่าง)
                    new Set(data.map(item => item.make_country)) // new set สร้างobjใหม่ ที่กรองตัวซ้ำ
                  )
                    .sort((a, b) => a.localeCompare(b)) // เรียงลำดับตัวอักษร
                    .map(noDuplicateCountry => ({
                      value: noDuplicateCountry,
                      label: noDuplicateCountry
                    }))
                ]}
              />
              <Input
                style={{ width: '30%', height: '35%' }}
                placeholder="Search Name"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)} //เอาไว้เก็บอักษรตามที่user พิมพ์
              />
            </div>
            <div id='optionRight'>
              <Button
                style={{ width: '90%', height: '35%', fontSize: '1rem', fontWeight: 400 }}
                type="primary"
                onClick={handleAdd} // เพิ่มรถใหม่
              >
                Add New Car
              </Button>
            </div>
          </div>
        </div>
        <div id='tableZone' style={{ height: '70%', width: '100%', display: 'flex', justifyContent: 'center' }}>
          <div id='table' style={{ height: '63%', width: '70%', backgroundColor: '#fafafa' }}>
            <Table<Icar> columns={columns} dataSource={filteredData} rowKey="make_id"
              style={{ height: '100%', width: '100%' }}
              pagination={{
                pageSize: 5,
                showSizeChanger: false, // ไม่เปิดตัวเลือกpagesize
                hideOnSinglePage: true, //ไม่showเลื่อนหน้าตอนมีหน้าเดียว
              }}
            />
          </div>
        </div>
      </div>
      <Modal
        title={editingCar ? 'Edit Car' : 'Add Car'}
        open={isModalVisible}
        onCancel={handleModalCancel} // ปิด Modal  
        footer={null}
      >
        <Form
          form={form} //เอาไว้โยงกับไอ้ที่เขียนไว้ด้านบน
          onFinish={handleModalOk} // ส่งข้อมูลเมื่อกด "Save Changes"
        >
          <Form.Item
            label="CarName"
            name="make_display"
            rules={[{ required: true, message: 'Please input the car name!' }]}
            // style={{width:'20%'}}
            labelCol={{ span: 4 }}  // Adjust label width
            wrapperCol={{ span: 18 }}  // Adjust input width
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Country"
            name="make_country"
            rules={[{ required: true, message: 'Please select the country!' }]}
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 18 }}
          >
            <AutoComplete
              options={allCountries}
              filterOption={(inputValue, option) =>
                option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1// "!" หลัง option เอาไว้แก้ที่มันแจ้งว่าอาจเป็นnull หรือ undefined 
                //!==-1 make sure ว่ามันจะไม่  null or undefined 
              }
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit"> {/*htmlType="submit" ใช้แทน onfinish ของ form*/}
              {editingCar ? 'Save Changes' : 'Add Car'} {/* ถ้าEdit ปุ่มเป็นsave if no edit status ปุ่มเป็นAdd car */}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default App
