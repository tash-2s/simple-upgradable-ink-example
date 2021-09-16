#![cfg_attr(not(feature = "std"), no_std)]

use ink_lang as ink;

#[ink::contract]
mod logic {
    use data::contract::Data;
    use ink_env::call::FromAccountId;

    #[ink(storage)]
    pub struct Logic {
        data_account_id: AccountId,
    }

    impl Logic {
        #[ink(constructor)]
        pub fn new(data_account_id: AccountId) -> Self {
            Self { data_account_id }
        }

        #[ink(message)]
        pub fn get_data_account_id(&self) -> AccountId {
            self.data_account_id
        }

        #[ink(message)]
        pub fn set(&self) {
            let mut data = Data::from_account_id(self.data_account_id);
            data.set(true);
        }
    }
}
