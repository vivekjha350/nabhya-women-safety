import { useEffect, useState } from "react";

type Contact = {
  id: number;
  name: string;
  phone: string;
  relation: string;
  primary: boolean;
};

const STORAGE_KEY = "nabhya_contacts";

function TrustedContacts() {
  const [contacts, setContacts] =
    useState<Contact[]>([]);

  const [name, setName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [relation, setRelation] =
    useState("");

  const [message, setMessage] =
    useState("");

  /* =====================================================
     LOAD CONTACTS
  ===================================================== */

  useEffect(() => {
    try {
      const saved =
        localStorage.getItem(
          STORAGE_KEY
        );

      if (!saved) {
        setContacts([]);
        return;
      }

      const parsed: unknown =
        JSON.parse(saved);

      if (Array.isArray(parsed)) {
        setContacts(
          parsed as Contact[]
        );
      } else {
        setContacts([]);
      }
    } catch (error) {
      console.error(
        "Unable to load trusted contacts:",
        error
      );

      setContacts([]);
    }
  }, []);

  /* =====================================================
     SAVE CONTACTS TO LOCAL STORAGE
  ===================================================== */

  const saveContacts = (
    updatedContacts: Contact[]
  ) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          updatedContacts
        )
      );

      setContacts(
        updatedContacts
      );
    } catch (error) {
      console.error(
        "Unable to save trusted contacts:",
        error
      );

      setMessage(
        "Unable to save contact."
      );
    }
  };

  /* =====================================================
     ADD CONTACT
  ===================================================== */

  const addContact = () => {
    const cleanName =
      name.trim();

    const cleanPhone =
      phone.trim();

    const cleanRelation =
      relation.trim();

    if (
      !cleanName ||
      !cleanPhone ||
      !cleanRelation
    ) {
      setMessage(
        "Please fill all contact details."
      );
      return;
    }

    const newContact: Contact = {
      id: Date.now(),
      name: cleanName,
      phone: cleanPhone,
      relation: cleanRelation,

      // First contact automatically becomes primary
      primary:
        contacts.length === 0,
    };

    const updatedContacts = [
      ...contacts,
      newContact,
    ];

    saveContacts(
      updatedContacts
    );

    // Clear form
    setName("");
    setPhone("");
    setRelation("");

    setMessage(
      "Trusted contact saved successfully."
    );
  };

  /* =====================================================
     DELETE CONTACT
  ===================================================== */

  const deleteContact = (
    id: number
  ) => {
    const contactToDelete =
      contacts.find(
        (contact) =>
          contact.id === id
      );

    let updatedContacts =
      contacts.filter(
        (contact) =>
          contact.id !== id
      );

    /*
      If primary contact is deleted,
      make the first remaining contact primary.
    */

    if (
      contactToDelete?.primary &&
      updatedContacts.length > 0
    ) {
      updatedContacts =
        updatedContacts.map(
          (contact, index) => ({
            ...contact,
            primary:
              index === 0,
          })
        );
    }

    saveContacts(
      updatedContacts
    );

    setMessage(
      "Contact removed."
    );
  };

  /* =====================================================
     MAKE PRIMARY
  ===================================================== */

  const makePrimary = (
    id: number
  ) => {
    const updatedContacts =
      contacts.map(
        (contact) => ({
          ...contact,
          primary:
            contact.id === id,
        })
      );

    saveContacts(
      updatedContacts
    );

    setMessage(
      "Primary contact updated."
    );
  };

  /* =====================================================
     UI
  ===================================================== */

  return (
    <section className="w-full">

      <div className="mx-auto w-full max-w-5xl">

        {/* HEADER */}

        <div className="mb-7">

          <div className="inline-flex items-center gap-2 rounded-full border border-purple-300/15 bg-purple-300/[0.05] px-3 py-2 text-[10px] font-bold tracking-[0.18em] text-purple-200/80">
            👥 TRUSTED NETWORK
          </div>

          <h1 className="mt-4 text-3xl font-black text-white sm:text-4xl">
            Trusted Contacts
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/40">
            Add people you trust who can be
            contacted during an emergency.
          </p>

        </div>

        {/* ADD CONTACT */}

        <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-6 sm:p-8">

          <div className="mb-6">

            <h2 className="text-xl font-black text-white">
              Add Trusted Contact
            </h2>

            <p className="mt-1 text-sm text-white/35">
              Contact information is stored
              locally on this device.
            </p>

          </div>

          <div className="grid gap-4 sm:grid-cols-2">

            {/* NAME */}

            <div>

              <label
                htmlFor="contact-name"
                className="mb-2 block text-xs font-bold tracking-[0.14em] text-white/35"
              >
                NAME
              </label>

              <input
                id="contact-name"
                type="text"
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value
                  )
                }
                placeholder="Father / Mother / Friend"
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-white outline-none placeholder:text-white/20 focus:border-purple-300/30"
              />

            </div>

            {/* PHONE */}

            <div>

              <label
                htmlFor="contact-phone"
                className="mb-2 block text-xs font-bold tracking-[0.14em] text-white/35"
              >
                PHONE NUMBER
              </label>

              <input
                id="contact-phone"
                type="tel"
                value={phone}
                onChange={(event) =>
                  setPhone(
                    event.target.value
                  )
                }
                placeholder="+91 9876543210"
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-white outline-none placeholder:text-white/20 focus:border-purple-300/30"
              />

            </div>

            {/* RELATION */}

            <div className="sm:col-span-2">

              <label
                htmlFor="contact-relation"
                className="mb-2 block text-xs font-bold tracking-[0.14em] text-white/35"
              >
                RELATION
              </label>

              <input
                id="contact-relation"
                type="text"
                value={relation}
                onChange={(event) =>
                  setRelation(
                    event.target.value
                  )
                }
                placeholder="Father, Mother, Brother, Friend..."
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-white outline-none placeholder:text-white/20 focus:border-purple-300/30"
              />

            </div>

          </div>

          <button
            type="button"
            onClick={addContact}
            className="mt-5 min-h-[56px] w-full rounded-2xl bg-gradient-to-r from-purple-400 to-cyan-300 px-5 font-black text-slate-950 transition hover:brightness-105"
          >
            + Save Trusted Contact
          </button>

          {/* MESSAGE */}

          {message && (
            <div className="mt-4 rounded-2xl border border-emerald-300/10 bg-emerald-300/[0.03] p-4">

              <p className="text-sm text-emerald-200/80">
                {message}
              </p>

            </div>
          )}

        </div>

        {/* CONTACT LIST */}

        <div className="mt-6">

          <div className="mb-4 flex items-center justify-between">

            <div>

              <h2 className="text-xl font-black text-white">
                Saved Contacts
              </h2>

              <p className="mt-1 text-xs text-white/35">
                {contacts.length} trusted{" "}
                {contacts.length === 1
                  ? "contact"
                  : "contacts"}
              </p>

            </div>

            <div className="rounded-full border border-emerald-300/10 bg-emerald-300/[0.03] px-3 py-2 text-[10px] font-bold tracking-[0.12em] text-emerald-300/70">
              LOCAL STORAGE
            </div>

          </div>

          {/* EMPTY */}

          {contacts.length === 0 ? (

            <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">

              <div className="text-5xl">
                👥
              </div>

              <h3 className="mt-5 text-xl font-black text-white">
                No Trusted Contacts
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/35">
                Add at least one trusted person
                so Nabhya can use them for
                emergency features.
              </p>

            </div>

          ) : (

            <div className="grid gap-4">

              {contacts.map(
                (contact) => (
                  <div
                    key={contact.id}
                    className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-5"
                  >

                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

                      {/* AVATAR */}

                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-purple-300/15 bg-purple-300/[0.05] text-2xl">
                        👤
                      </div>

                      {/* INFO */}

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-center gap-2">

                          <h3 className="text-lg font-black text-white">
                            {contact.name}
                          </h3>

                          {contact.primary && (
                            <span className="rounded-full border border-emerald-300/15 bg-emerald-300/[0.05] px-2.5 py-1 text-[9px] font-bold tracking-[0.12em] text-emerald-300">
                              PRIMARY
                            </span>
                          )}

                        </div>

                        <p className="mt-1 text-sm text-purple-200/60">
                          {contact.relation}
                        </p>

                        <p className="mt-2 font-mono text-sm text-white/50">
                          {contact.phone}
                        </p>

                      </div>

                      {/* ACTIONS */}

                      <div className="flex flex-wrap gap-2">

                        {!contact.primary && (
                          <button
                            type="button"
                            onClick={() =>
                              makePrimary(
                                contact.id
                              )
                            }
                            className="rounded-xl border border-cyan-300/15 bg-cyan-300/[0.04] px-3 py-2 text-xs font-bold text-cyan-200"
                          >
                            Make Primary
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            deleteContact(
                              contact.id
                            )
                          }
                          className="rounded-xl border border-red-300/15 bg-red-300/[0.04] px-3 py-2 text-xs font-bold text-red-200"
                        >
                          Delete
                        </button>

                      </div>

                    </div>

                  </div>
                )
              )}

            </div>

          )}

        </div>

        {/* SECURITY NOTE */}

        <div className="mt-6 rounded-3xl border border-yellow-300/10 bg-yellow-300/[0.025] p-5">

          <div className="flex items-start gap-3">

            <span className="text-xl">
              🔒
            </span>

            <div>

              <p className="font-bold text-white">
                Current Storage
              </p>

              <p className="mt-1 text-xs leading-6 text-white/40">
                Trusted contacts are currently
                saved in your browser's local
                storage. They will remain available
                after navigating away or refreshing
                the page on the same browser/device.
              </p>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}

export default TrustedContacts;