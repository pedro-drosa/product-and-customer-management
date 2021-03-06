import React, { FormEvent, useEffect, useState } from "react";
import {Link} from 'react-router-dom';
import * as Yup from 'yup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { 
  FiCornerRightDown, 
  FiX,
  FiPlus,
  FiTerminal,
  FiUsers,
  FiMail,
  FiMapPin,
} from "react-icons/fi";

import { Input } from '../../components/Input';
import { Button } from '../../components/Button';

import './style.scss';
import '../../components/Button/style.scss';

import viacep from '../../services/viacep';

interface Customer {
  name: string;
  email: string;
  address: {
    cep: string;
    uf: string;
    city: string;             
  }
}

interface Address {
  cep: string;
  localidade: string;
  uf: string;
  erro?:boolean;
}

export const Customers:React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const storageCustomers = localStorage.getItem('customers');
    if(storageCustomers){
      return JSON.parse(storageCustomers);
    }
    return [];
  });

  useEffect(()=>{
    localStorage.setItem('customers', JSON.stringify(customers));
  },[customers]);

  //FormInputs
  const [newName, setNewName] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newCep, setNewCep] = useState<string>('');

  const schema = Yup.object().shape({
    name: Yup.string().required(),
    email: Yup.string().required().email(),
    cep: Yup.string().length(8).required(),
  });
  
  async function handleAddCustomer(event:FormEvent): Promise<void> {
    event.preventDefault();
    const notifySuccess = () => toast.success("Customer successfully added.", {toastId : 'customer'});
    const notifyError = () => toast.error("Error registering customer, check data and try again.", {toastId : 'customer'});
    
    if (newName?.trim() === '') {
      notifyError();
      return;
    }

    if(!(await schema.isValid({ name: newName, email: newEmail, cep:newCep }))) {
      notifyError();
      return;
    }

    if (newName && newEmail && newCep) {
      try {
        const response = await viacep.get<Address>(`${newCep}/json/`);
        const address = response.data;

        if(response.data.erro){
          notifyError();
          return;
        }
        
        const newCustomer:Customer = {
          name: newName,
          email: newEmail,
          address:{
            cep: address.cep,
            uf: address.uf,
            city:address.localidade
          }
        };
        
        setCustomers([...customers, newCustomer]);
        localStorage.setItem('customers',JSON.stringify(customers));
        notifySuccess();
        
        //Clear input
        setNewName('');
        setNewEmail('');
        setNewCep('');
      } catch (error) {
        notifyError();
      }
    }

  }

  return(
    <>
      <header>
        <div id="brand">
          <a href="/customers"><FiTerminal/></a>
        </div>
        <nav>
          <ul>
            <li><Link to="/"><FiX/>Sair</Link></li>
          </ul>
        </nav>
      </header>
      <main>
        <div>
          <h2>Registration and Listing</h2>
          <h1>View and list all registered customers</h1>
          <p>you can add new customers via the form, they will remain saved in your local storage.</p>
        </div>
        <form onSubmit={handleAddCustomer}>
          <h2>Customer Information</h2>
          <Input value={newName} 
            onChange={(e) => {setNewName(e.target.value)}} 
            type="text" 
            placeholder="Customer Name"
          />
          <Input value={newEmail} 
            onChange={(e) => {setNewEmail(e.target.value)}} 
            type="email" 
            placeholder="customer@email.com"
          />
          <Input value={newCep} 
            onChange={(e) => {setNewCep(e.target.value)}} 
            type="text" 
            placeholder="Enter the zip code"
          />
          <div className="btn-group">
            <ToastContainer/>
            <Button className="btn btn-primary" type="submit"><FiPlus/>Add</Button>
          </div>
        </form>
      </main>
      <section className="description">
        <div>
          <h2><FiUsers/>Added Customers</h2>
          <p>This section contains a list of all customers registered in localstorage</p>
        </div>
        <FiCornerRightDown/>
      </section>
      <section className="customers">
        {
          customers.length > 0 ?
          customers.map((customer, index) => {
            return(
              <dl key={index}>
                <dt>{customer.name}</dt>
                <dd><FiMail/>{customer.email}</dd>
                <dd><FiMapPin/>{`${customer.address.city},${customer.address.uf}`}</dd>
              </dl> 
            )
          }) : <h1 className="info">Ops, no customers registered :(</h1>
        }
      </section>
      <footer>
      <p>This project was created during the <a href="https://www.hiringcoders.com.br/">Hiring Coders</a> training,<br/> promoted by <a href="https://www.gama.academy/">Gama Academy</a> in partnership with <a href="https://vtex.com/br-pt/">V-Tex</a> <br/>and is under license from MIT.</p>
      </footer>
    </>
  )
}
