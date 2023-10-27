import { v4 as uuidv4 } from "uuid";
import { useMutation, useQuery } from "@apollo/client";

import CarForm from "./components/Forms/CarForm";
import PersonForm from "./components/Forms/PersonForm";

import Header from "./components/Layouts/Header";
import RecordsList from "./components/Other/RecordsList";

import {
  ADD_CAR,
  ADD_PERSON,
  GET_CARS_OF_PERSON_BY_ID,
  GET_PEOPLE,
} from "./graphql/queries";
import { useEffect } from "react";

export default function App() {
  const { loading, error, data } = useQuery(GET_PEOPLE);
  const [addPerson] = useMutation(ADD_PERSON);
  const [addCar] = useMutation(ADD_CAR);

  const handleAddPerson = (e) => {
    e.preventDefault();

    const data = new FormData(e.target);

    try {
      addPerson({
        variables: {
          id: uuidv4(),
          firstName: data.get("firstName"),
          lastName: data.get("lastName"),
        },
        update: (cache, { data: { addPerson } }) => {
          const data = cache.readQuery({ query: GET_PEOPLE });

          //Optimistically Add Person to People Property
          cache.writeQuery({
            query: GET_PEOPLE,
            data: {
              ...data,
              people: [addPerson, ...data.people],
            },
          });
        },
      });

      e.target.reset();
    } catch (error) {
      alert("Failed to add person");
    }
  };

  const handleAddCar = (e) => {
    e.preventDefault();

    const data = new FormData(e.target);

    const personId = data.get("personId");
    const make = data.get("make");
    const model = data.get("model");
    const year = data.get("year");
    const price = data.get("price");

    try {
      addCar({
        variables: {
          id: uuidv4(),
          personId,
          make,
          model,
          year: parseInt(year),
          price: parseInt(price),
        },
        update: (cache, { data: { addCar } }) => {
          const data = cache.readQuery({
            query: GET_CARS_OF_PERSON_BY_ID,
            variables: { id: personId },
          });

          //Optimistically Add Car to Cars Property
          cache.writeQuery({
            query: GET_CARS_OF_PERSON_BY_ID,
            variables: { id: personId },
            data: {
              ...data,
              carsOfPersonId: [...data.carsOfPersonId, addCar],
            },
          });
        },
      });

      e.target.reset();
    } catch (error) {
      alert("Failed to add car");
    }
  };

  useEffect(() => {
    document.title = "People and their cars";
  }, []);

  if (loading) return "Loading...";

  if (error) return `Error! ${error.message}`;

  return (
    <>
      <div className="mx-auto max-w-[1200px] min-h-screen p-4">
        <Header />

        <main className=" flex flex-col gap-4">
          <section className="py-4 mt-4">
            <h2 className="text-center font-semibold uppercase my-4">
              Add Person
            </h2>

            <PersonForm onSubmit={handleAddPerson} />
          </section>

          {data?.people?.length > 0 ? (
            <section className="py-4 mb-8">
              <h2 className="text-center font-semibold uppercase my-4">
                Add Car
              </h2>

              <CarForm
                people={data.people}
                onSubmit={handleAddCar}
              />
            </section>
          ) : null}

          <RecordsList data={data} />
        </main>
      </div>
    </>
  );
}
