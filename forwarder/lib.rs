#![cfg_attr(not(feature = "std"), no_std)]

use ink_lang as ink;

#[ink::contract]
mod contract {
    use ink_env::call::FromAccountId;
    use ink_prelude::vec::Vec as StdVec;
    use logic::contract::Logic;

    #[ink(storage)]
    pub struct Forwarder {
        logic_account_id: AccountId,
        allowlist: StdVec<AccountId>,
    }

    impl Forwarder {
        #[ink(constructor)]
        pub fn new(logic_account_id: AccountId) -> Self {
            let mut allowlist = StdVec::with_capacity(1);
            allowlist.push(Self::env().caller());

            Self {
                logic_account_id,
                allowlist,
            }
        }

        #[ink(message)]
        pub fn do_something(&self) {
            let logic = Logic::from_account_id(self.logic_account_id);
            logic.do_something();
        }

        #[ink(message)]
        pub fn get_logic_account_id(&self) -> AccountId {
            self.logic_account_id
        }

        #[ink(message)]
        pub fn change_logic_account_id(&mut self, new_account_id: AccountId) {
            self.only_allowlist_account();
            self.logic_account_id = new_account_id;
        }

        // allowlist

        #[ink(message)]
        pub fn get_allowlist(&self) -> StdVec<AccountId> {
            self.allowlist.clone()
        }

        #[ink(message)]
        pub fn add_allowed_account(&mut self, new_account_id: AccountId) {
            self.only_allowlist_account();
            self.allowlist.push(new_account_id);
        }

        #[ink(message)]
        pub fn remove_allowed_account(&mut self, account_id: AccountId) {
            self.only_allowlist_account();
            self.allowlist.retain(|a| a != &account_id);
        }

        fn only_allowlist_account(&self) {
            assert!(self.allowlist.contains(&self.env().caller()), "not allowed");
        }
    }
}
