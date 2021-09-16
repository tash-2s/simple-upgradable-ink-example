#![cfg_attr(not(feature = "std"), no_std)]

use ink_lang as ink;

#[ink::contract]
mod data {
    use ink_prelude::{vec as std_vec, vec::Vec as StdVec};

    #[ink(storage)]
    pub struct Data {
        value: bool,
        allowlist: StdVec<AccountId>,
    }

    impl Data {
        #[ink(constructor)]
        pub fn new(init_value: bool) -> Self {
            Self {
                value: init_value,
                allowlist: std_vec![Self::env().caller()],
            }
        }

        #[ink(message)]
        pub fn get(&self) -> bool {
            self.value
        }

        #[ink(message)]
        pub fn get_allowlist(&self) -> StdVec<AccountId> {
            self.allowlist.clone()
        }

        #[ink(message)]
        pub fn set(&mut self, new_value: bool) {
            assert!(self.allowlist.contains(&self.env().caller()), "not allowed");
            self.value = new_value;
        }

        #[ink(message)]
        pub fn add_allowed_account(&mut self, new_account_id: AccountId) {
            assert!(self.allowlist.contains(&self.env().caller()), "not allowed");
            self.allowlist.push(new_account_id);
        }

        #[ink(message)]
        pub fn remove_allowed_account(&mut self, account_id: AccountId) {
            assert!(self.allowlist.contains(&self.env().caller()), "not allowed");
            self.allowlist.retain(|a| a != &account_id);
        }
    }
}
